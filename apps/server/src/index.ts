/* eslint-disable no-fallthrough */
/**
 * Init code
 */
import './core/init.js'
/**
 * Module dependencies.
 */
import app from './core/app.js'
import logger from './core/logger.js'
import http from 'http'
import redis from './core/redis.js'
import mongo from './core/mongo.js'
import { generateAssetLinksFile } from './apps/apps.service.js'

/* Create HTTP server. */
const server = http.createServer(app)

/* Get port from environment and store in Express. */
const port = normalizePort(
  process.env.PORT ?? process.env.SERVER_PORT ?? '5000'
)
app.set('port', port)

/**
 * Server initialization function
 */
async function main(): Promise<void> {
  try {
    /* connect to mongo */
    logger.info('Connecting to MongoDB...')
    await mongo.init()

    logger.info('Connecting to Redis...')
    await redis.init()

    logger.info('Generate Asset Links file...')
    await generateAssetLinksFile()

    /* Listen on provided port, on all network interfaces. */
    logger.info('Starting the web server...')
    server.on('error', onError)
    server.on('listening', onListening)
    server.listen(port, () => {
      logger.info(`Web server started at ${port}`)
    })
  } catch (error) {
    logger.error('An error occurred during initialization!')
    logger.error(error)
  }
}

/*
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val: string): any {
  const port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return 0
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: any): void {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind =
    typeof port === 'string'
      ? `Pipe ${port}`
      : typeof port === 'number'
      ? `Port ${port.toString()}`
      : ''

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(bind + ' requires elevated privileges')
      process.exit(1)
    case 'EADDRINUSE':
      logger.error(bind + ' is already in use')
      process.exit(1)
    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening(): void {
  const addr = server.address()
  if (addr != null) {
    const bind = typeof addr === 'string' ? `Pipe ${addr}` : `Port ${addr.port}`
    logger.info(`Listening on ${bind}`)
  }
}

/* just call the server init function and ignore the returned promise */
main().finally(() => {})
