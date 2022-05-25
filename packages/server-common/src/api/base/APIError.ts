import { ErrorStatus } from '../Status'
import BaseResponse from './BaseResponse'
interface APIError extends BaseResponse {
  status: ErrorStatus
}

export default APIError
