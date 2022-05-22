/** When a request ended successfully */
type NormalStatus = 200 | 201
/** When a request ended with an error */
type ErrorStatus = 400 | 401 | 403 | 404 | 500

export { NormalStatus, ErrorStatus }
