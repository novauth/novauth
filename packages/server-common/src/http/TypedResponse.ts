import { ErrorStatus, NormalStatus } from './Status'

/** The http response from the server of all endpoints */
type TypedResponse<T> =
  | {
      status: NormalStatus
      message: string | null
      data: T // Data is present if the request ended successfully
    }
  | {
      status: ErrorStatus
      message: string | null
      // Data is not present if status is an error
    }

export default TypedResponse
