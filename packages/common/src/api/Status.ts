/** When a request ended successfully */
type NormalStatus = 200 | 201
/** When a request ended with an error */
type ErrorStatus = 400 | 401 | 403 | 404 | 500

function isErrorStatus(status: number): boolean {
  return (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    status === 404 ||
    status === 500
  )
}

function isNormalStatus(status: number): boolean {
  return (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    status === 404 ||
    status === 500
  )
}

export { NormalStatus, ErrorStatus, isErrorStatus, isNormalStatus }
