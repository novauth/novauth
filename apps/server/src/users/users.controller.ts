import {
  getUser as getUserfromService,
  putUser as putUserFromService,
} from './users.service.js'
import express from 'express'
import {
  setResponse,
  makeApiResponse,
  makeControllerError,
} from '../core/utils.js'

async function getUser(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<express.Response | undefined> {
  try {
    const reqUser: any = req.user
    const user = await getUserfromService(req.params.email)
    if (user !== null) {
      return setResponse(res, makeApiResponse(200, '', user))
    }
    next(makeControllerError(null, 404, 'User not found'))
  } catch (error) {
    console.log(error)
    next(
      makeControllerError(
        null,
        500,
        'Something went wrong while fetching the user'
      )
    )
  }
}

async function putUser(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<express.Response | undefined> {
  try {
    const reqUser: any = req.user
    const result = await putUserFromService(req.body.action, req.params.email, {
      user: req.body.user,
      app: req.body.app,
    })
    /* eslint-disable no-fallthrough */
    switch (result.result) {
      case 'OK_CREATED':
        return setResponse(
          res,
          makeApiResponse(201, 'User created successfully', result.data)
        )
      case 'ERROR_USER_ALREADY_EXISTS':
        next(
          makeControllerError(
            null,
            400,
            'A user with the same email already exists'
          )
        )
        break
    }
    /* eslint-enable no-fallthrough */
  } catch (error) {
    console.log(error)
    next(
      makeControllerError(
        null,
        500,
        'Something went wrong while updating the user'
      )
    )
  }
}

/**
 * Check whether the user which is making the request is the same as the one passed as a param in the URL.
 * Blocks the request and sends a 401 if the user whose resources are accessed does not match the user who's making the request.
 * @param req
 * @param res
 * @param next
 */
function checkRequestingUser(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  const reqUser: any = req.user
  if (req.params.email !== reqUser.sub)
    next(
      makeControllerError(
        null,
        403,
        'Cannot access the requested resource owned by another user'
      )
    )
  else next()
}

export { getUser, putUser, checkRequestingUser }
