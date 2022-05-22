import express from 'express'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import path from 'path'
import indexRouter from './app.routes'
import usersRouter from '../users/users.routes'
import authRouter from '../auth/auth.routes'
import cors from 'cors'
import { middleware as openApiMiddleware } from 'express-openapi-validator'
import { makeResponse } from './utils'
import logger from './logger'

const app = express()
app.use(morgan(`${process.env.NODE_ENV}`))
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(
  cors({
    origin: [String(process.env.CLIENT_URL)],
  })
)
app.use(
  openApiMiddleware({
    apiSpec: path.join(__dirname, '../../openapi.yaml'),
    validateRequests: true,
    ignorePaths: (path: string) => path === '/',
  })
)

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err.error !== null && err.error !== undefined) {
      logger.error('An error occurred while serving a request!')
      logger.error('-----------------------------------------')
      logger.error(err.error)
      logger.error('-----------------------------------------')
    }
    return makeResponse(
      res,
      err.status === undefined ? 500 : err.status,
      err.message
    )
  }
)

export default app
