import { ErrorStatus } from '../Status.js'
import BaseResponse from './BaseResponse.js'
interface APIError extends BaseResponse {
  status: ErrorStatus
}

export default APIError
