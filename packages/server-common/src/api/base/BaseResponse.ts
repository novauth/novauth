/** The http response from the server of all endpoints */
interface BaseResponse {
  status: number
  message: string
  // Data is not present if status is an error
}

export default BaseResponse
