/**
 * Set of utilities used across the whole app
 */

import {
  ErrorStatus,
  NormalStatus,
  TypedResponse,
} from '@novauth/server-common'
import express from 'express'

/**
 * Make a custom response body given the parameters
 * @param status
 * @param message
 * @param data
 * @returns the response body object
 */
function responseBody<T>(
  status: ErrorStatus,
  message: string | null
): TypedResponse<T>
function responseBody<T>(
  status: NormalStatus,
  message: string | null,
  data: T
): TypedResponse<T>
function responseBody<T>(
  status: any,
  message: string | null,
  data?: T
): TypedResponse<T> {
  return {
    status,
    message: message !== null ? message : '',
    data,
  }
}

function makeResponse(
  res: express.Response,
  status: ErrorStatus,
  message: string | null
): express.Response
function makeResponse(
  res: express.Response,
  status: NormalStatus,
  message: string | null,
  data: object
): express.Response
function makeResponse(
  res: express.Response,
  status: any,
  message: string | null,
  data?: object
): express.Response {
  return res.status(status).json(responseBody(status, message, data))
}

/**
 * Defines an error in the API
 */
interface APIError {
  error: any | null
  status: number
  message: string
}

function makeError(
  error: any | null,
  status: number,
  message: string
): APIError {
  return {
    error,
    status,
    message,
  }
}

export { makeResponse, responseBody, makeError }
