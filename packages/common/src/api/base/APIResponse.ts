import { NormalStatus } from "../Status"
import BaseResponse from "./BaseResponse"

interface APIResponse<T> extends BaseResponse {
  status: NormalStatus
  data: T
}

export default APIResponse
