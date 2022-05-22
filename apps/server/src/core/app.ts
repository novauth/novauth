import express from 'express'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import indexRouter from './app.routes.js'
import usersRouter from '../users/users.routes.js'
import authRouter from '../auth/auth.routes.js'
import devicesRouter from '../devices/devices.routes.js'
import apiDocsRouter from './apidocs.routes.js'
import cors from 'cors'
import { middleware as openApiMiddleware } from 'express-openapi-validator'
import { makeResponse } from './utils.js'
import logger from './logger.js'

const app = express()
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: false }))
app.use('/.well-known', express.static('public/.well-known'))
app.use(cookieParser())
app.use(
  cors({
    origin: [String(process.env.CLIENT_URL)],
  })
)
app.use(
  openApiMiddleware({
    apiSpec: ('openapi.yaml'),
    validateRequests: true,
    ignorePaths: (path: string) => path === '/' || path.startsWith('/api-docs') || path.startsWith('/.well-known'),
  })
)

app.use('/', indexRouter)
app.use('/api-docs', apiDocsRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/devices', devicesRouter)

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
