/**
 * Set of utilities used across the whole app
 */
import {
  ErrorStatus,
  NormalStatus,
  APIResponse,
  APIError,
} from '@novauth/common'
import express from 'express'

/**
 * Defines an error in the API, signaled by a controller
 */
interface ControllerError {
  error: any | null
  apiError?: APIError
}

function makeControllerError(
  error: any | null,
  status: ErrorStatus,
  message: string
): ControllerError {
  return {
    error,
    apiError: makeApiError(status, message),
  }
}

/**
 * Make a custom response body given the parameters
 * @param status
 * @param message
 * @param data
 * @returns the response body object
 */
function makeApiResponse<T>(
  status: NormalStatus,
  message: string,
  data: T
): APIResponse<T> {
  return {
    status,
    message,
    data,
  }
}

/**
 * Make a custom API error given the parameters
 * @param status
 * @param message
 * @returns
 */
function makeApiError(status: ErrorStatus, message: string): APIError {
  return {
    status,
    message,
  }
}

/**
 * Sets the body and status to the provided response object
 * @param res
 * @param status
 * @param body
 * @returns
 */
function setResponse<T>(
  res: express.Response<any>,
  body: APIError | APIResponse<T>
): express.Response<APIError | APIResponse<T>> {
  return res.status(body.status).json(body)
}
export {
  makeApiResponse,
  makeApiError,
  makeControllerError,
  setResponse,
  ControllerError,
}
