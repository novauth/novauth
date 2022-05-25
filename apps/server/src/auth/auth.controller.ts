import express from 'express'
import {
  setResponse,
  makeApiResponse,
  makeControllerError,
} from '../core/utils.js'
import {
  basicAuthMiddleware,
  generateTokens,
  invalidateTokens,
  jwtAuthMiddleware,
  jwtRefreshMiddleware,
} from './auth.service.js'

async function login(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<express.Response | undefined> {
  if (req.user !== undefined) {
    const [accessToken, refreshToken] = await generateTokens(req.user)
    return setResponse(
      res,
      makeApiResponse(200, 'Login completed succesfully', {
        accessToken,
        refreshToken,
      })
    )
  }
  next(
    makeControllerError(
      null,
      500,
      'Something went wrong while performing the login'
    )
  )
}

async function refreshToken(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<express.Response | undefined> {
  if (req.user !== undefined) {
    const [accessToken, refreshToken] = await generateTokens(req.user)
    return setResponse(
      res,
      makeApiResponse(200, 'New tokens obtained succesfully', {
        accessToken,
        refreshToken,
      })
    )
  }
  next(
    makeControllerError(
      null,
      500,
      'Something went wrong while getting the new tokens'
    )
  )
}

async function logout(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<express.Response | undefined> {
  const reqUser: any = req.user
  if (reqUser !== undefined) {
    await invalidateTokens(reqUser.sub, reqUser.jti)
    return setResponse(
      res,
      makeApiResponse(200, 'Logout completed successfully', {})
    )
  }
  next(
    makeControllerError(
      null,
      500,
      'Something went wrong while performing the logout'
    )
  )
}

function authMiddleware(
  strategy: 'at' | 'rt' | 'basic',
  exemption?: (req: express.Request) => boolean
): (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => express.Response | undefined {
  const mw =
    strategy === 'at'
      ? jwtAuthMiddleware
      : strategy === 'rt'
      ? jwtRefreshMiddleware
      : basicAuthMiddleware
  if (exemption === undefined) return mw
  else
    return (req, res, next) => {
      if (exemption(req)) {
        next()
      } else {
        return mw(req, res, next)
      }
    }
}

export { login, logout, refreshToken, authMiddleware }
