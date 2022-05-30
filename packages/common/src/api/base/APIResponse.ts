import { NormalStatus } from "../Status.js"
import BaseResponse from "./BaseResponse.js"

interface APIResponse<T> extends BaseResponse {
  status: NormalStatus
  data: T
}

export default APIResponse
