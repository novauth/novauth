import { PushAuthenticationResponse } from '../push-authentication/index.js'

interface AppAPIPushAuthenticationResultRequest {
  type: 'push_authentication_result'
  data: PushAuthenticationResponse
}
export default AppAPIPushAuthenticationResultRequest
