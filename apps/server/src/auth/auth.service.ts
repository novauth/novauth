import passport from 'passport'
import passportJwt from 'passport-jwt'
import passportHttp from 'passport-http'
import jsonwebtoken from 'jsonwebtoken'
import crypto from 'crypto'
import redis from '../core/redis'
import { v4 as uuidv4 } from 'uuid'
import express from 'express'

import UserModel, { isPassword } from '../users/users.model'
import { makeError } from '../core/utils'

passport.use(
  'jwt-at',
  new passportJwt.Strategy(
    {
      jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    (jwtPayload, done) => {
      /* 1: check whether the user has been blocked or removed */
      isUserBlacklisted(jwtPayload.username)
        .then((blockedUser) => {
          if (blockedUser) {
            /* the user can't access the service since it has been blocked */
            return false
          }
          /* 2: check whether the access token is valid or not. This prevents using a token which have been used to log out */
          return isAccessTokenValid(jwtPayload)
        })
        .then((valid) => {
          if (!valid) {
            /* this access token is blacklisted or the user cannot access the service */
            return done(null, false)
          }

          /* if the user is not blocked and the access token is valid the user can access the service */
          return done(null, jwtPayload)
        })
        .catch((err: any) => done(err))
    }
  )
)

passport.use(
  'jwt-rt',
  new passportJwt.Strategy(
    {
      jwtFromRequest: passportJwt.ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: process.env.JWT_SECRET,
    },
    (jwtPayload, done) => {
      /* if refresh token is valid */
      isRefreshTokenValid(jwtPayload)
        .then(async (valid) => {
          if (valid) {
            /* retrieve info about the user */
            return await UserModel.findOne(
              { username: jwtPayload.sub },
              { username: 1, 'moderator.firstLogin': 1, email: 1 }
            ).then((user) => {
              if (user !== null) {
                /* user found, access granted */
                return done(null, user)
              }
              /* the user was not found */
              return done(null, false)
            })
          } else {
            /* refresh token reuse detected! need to invalidate any refresh token issued to the user, then report the refresh token is invalid */
            return await invalidateRefreshTokens(jwtPayload.sub).then(() => done(null, false))
          }
        })
        .catch((err: any) => done(err))
    }
  )
)

passport.use(
  'basic',
  new passportHttp.BasicStrategy((username, password, done) => {
    UserModel.findOne(
      { username: username },
      { username: 1, email: 1, password: 1, 'moderator.firstLogin': 1, banned: 1 },
      {},
      (err, user) => {
        /* server error */
        if (err !== null) return done(err)
        /* user not found */
        if (user === null) return done(null, false)
        /* check user password */
        isPassword(user, password)
          .then((result) => {
            if (result) {
              /* credentials ok! */
              return done(null, user)
            } else {
              /* credentials not valid */
              return done(null, false)
            }
          })
          .finally(() => {})
      }
    )
      .then(() => {})
      .catch(() => {})
  })
)

/**
 * Generate a new access token for the provided user.
 * @param tokenData any data which need to be included in the JWT body
 * @param username the username which will be put in the subject claim
 * @returns the newly created access token as string
 */
function generateAccessToken(tokenData: object, username: string): string {
  return jsonwebtoken.sign(tokenData, String(process.env.JWT_SECRET), {
    expiresIn: `${ACCESS_TOKEN_EXPIRY.SECONDS}s`,
    subject: username,
    jwtid: generateJti(),
  })
}

/**
 * Generate a new refresh token for the provided user. This function also takes care of enforcing refresh token rotation by invalidating any previously created refresh token
 * @param username the username which will be put in the subject claim
 * @returns the newly created refresh token as string
 */
async function generateRefreshToken(username: string): Promise<string> {
  const jti = generateJti()
  /* set user current valid token to the newly created one */
  /* this operation also enforces json token rotation: any previously created refresh token won't be valid, since this is the only token which is present in the cache */
  /* no need to hash the jti since even if stolen won't be useful */
  await redis.setex(`USER_${username}_RT`, REFRESH_TOKEN_EXPIRY.SECONDS, jti)
  return jsonwebtoken.sign(
    {
      token: crypto.randomBytes(16).toString('hex'),
    },
    String(process.env.JWT_SECRET),
    { expiresIn: `${REFRESH_TOKEN_EXPIRY.SECONDS}s`, subject: username, jwtid: jti }
  )
}

/**
 * Get a new pair of access and refresh tokens for the provided user.
 */
async function generateTokens(user: any): Promise<string[]> {
  const tokenData = {
    email: user.email,
    moderator: user.moderator,
  }
  const accessToken = generateAccessToken(tokenData, user.username)
  const refreshToken = await generateRefreshToken(user.username)
  return [accessToken, refreshToken]
}

/**
 * Check if the provided user has been recently blacklisted (e.g. due to it being blocked or removed by a moderator)
 * @param username
 */
async function isUserBlacklisted(username: string): Promise<boolean> {
  const userBlacklisted = await redis.get(`USER_${username}_BL`)
  return userBlacklisted !== null && userBlacklisted === 'true'
}

/**
 * Check if the token identified by the provided jti has been invalidated (e.g. due to a logout request)
 * @param jti
 */
async function isAccessTokenValid(token: any): Promise<boolean> {
  const accessTokenValid = await redis.get(`AT_${String(token.jti)}`)
  /* if no entry for the access token was found in the cache, the token is valid */
  return accessTokenValid === null
}

/**
 * Check if the refresh token identified by the provided jti has been invalidated (e.g. after the refresh token rotation)
 * @param jti
 */
async function isRefreshTokenValid(token: any): Promise<boolean> {
  const refreshTokenJti = await redis.get(`USER_${String(token.sub)}_RT`)
  return refreshTokenJti === token.jti
}

/**
 * Invalidate both provided access and any refresh token for the provided user
 * @param username the user whose access and refresh tokens will be invalidated
 */
async function invalidateTokens(username: string, atJti: string): Promise<void> {
  /* remove refresh tokens */
  await invalidateRefreshTokens(username)
  /* add key to invalidate access token */
  await redis.setex(`AT_${atJti}`, ACCESS_TOKEN_EXPIRY.SECONDS, 'true')
}

/**
 * Invalidate any refresh token for the provided user
 * @param username the user whose refresh tokens will be invalidated
 */
async function invalidateRefreshTokens(username: string): Promise<boolean> {
  /*
    remove refresh token entry from the cache
    no need to explicitly invalidate previous refresh tokens, since they will already be recognized as invalid,
    due to the absence of the related key in the cache
  */
  await redis.del(`USER_${username}_RT`)
  return true
}

function generateJti(): string {
  return uuidv4()
}

/**
 * Blacklist a user, preventing him to access the service
 * @param username username of the user to blacklist
 */
async function blacklistUser(username: string): Promise<void> {
  // add user to blacklist. this will allow to invalidate any currently valid access token
  await redis.setex(`USER_${username}_BL`, ACCESS_TOKEN_EXPIRY.SECONDS, '')
  // auth: invalidate currently valid refresh token to prevent user for requesting a new access token
  await invalidateRefreshTokens(username)
}

/**
 * Unblacklist a user, allowing him to access the service again
 * @param username username of the user to unblacklist
 */
async function unblacklistUser(username: string): Promise<void> {
  // remove the user from the blacklist, if the key is still present in cache
  await redis.del(`USER_${username}_BL`)
}

/**
 * Middlewares
 */
const jwtAuthMiddleware = passport.authenticate('jwt-at', { session: false })
const jwtRefreshMiddleware = passport.authenticate('jwt-rt', { session: false })
const basicAuthMiddleware = function (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  passport.authenticate('basic', { session: false }, function (err: any, user: any, info) {
    if (err !== null) {
      return next(err)
    }
    if (user !== null && user !== false) {
      if (user.banned === true) return next(makeError(null, 403, 'The user is banned'))
      req.user = user
      return next()
    }

    return next(makeError(null, 401, 'Invalid username/password'))
  })(req, res, next)
}



/**
 * Consts
 */
const REFRESH_TOKEN_EXPIRY = {
  SECONDS: 172800,
}
const ACCESS_TOKEN_EXPIRY = {
  SECONDS: 900,
}
export {
  jwtAuthMiddleware,
  jwtRefreshMiddleware,
  basicAuthMiddleware,
  blacklistUser,
  unblacklistUser,
  generateTokens,
  invalidateTokens,
  invalidateRefreshTokens,
  REFRESH_TOKEN_EXPIRY,
  ACCESS_TOKEN_EXPIRY,
  isAccessTokenValid,
}
