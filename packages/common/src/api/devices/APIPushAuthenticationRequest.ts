import { PublicKeyCredentialRequestOptions } from 'fido2-lib'

/**
 * The push authentication request sent to the API
 */
interface APIPushAuthenticationRequest {
  payload: {
    assertionRequest: PublicKeyCredentialRequestOptions
  }
}

export default APIPushAuthenticationRequest