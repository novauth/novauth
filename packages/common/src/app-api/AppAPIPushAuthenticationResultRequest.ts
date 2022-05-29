import { PushAuthenticationResponse } from '../push-authentication'

interface AppAPIPushAuthenticationResultRequest {
  type: 'push_authentication_result'
  data: PushAuthenticationResponse
}
export default AppAPIPushAuthenticationResultRequest
