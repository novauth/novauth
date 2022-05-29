import PushAuthenticationPayload from '../../push-authentication/PushAuthenticationPayload'

/**
 * The push authentication request sent to the API
 */
interface APIPushAuthenticationRequest {
  payload: PushAuthenticationPayload
}

export default APIPushAuthenticationRequest
