import { PublicKeyCredentialRequestOptions } from 'fido2-lib'

interface PushAuthenticationPayload {
  app: {
    name: string
    origin: string
    webhook: string
  }
  assertionRequest: PublicKeyCredentialRequestOptions
}

export default PushAuthenticationPayload
