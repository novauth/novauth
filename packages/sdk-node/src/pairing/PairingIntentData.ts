import { PublicKeyCredentialCreationOptions } from "fido2-lib"

type Version = '0.0.0'

type NotificationProvider = 'novauth'

interface PairingIntentData {
  version: Version
  notificationProvider: NotificationProvider
  origin: string
  webhook: string
  attestationRequest: PublicKeyCredentialCreationOptions
}

interface PairingIntentDataCompressed {
  v: Version
  n: NotificationProvider
  o: string
  w: string
  a: PublicKeyCredentialCreationOptions
}

function compress(request: PairingIntentData): PairingIntentDataCompressed {
  return {
    v: request.version,
    n: request.notificationProvider,
    o: request.origin,
    w: request.webhook,
    a: request.attestationRequest,
  }
}

function decompress(request: PairingIntentDataCompressed): PairingIntentData {
  return {
    version: request.v,
    notificationProvider: request.n,
    origin: request.o,
    webhook: request.w,
    attestationRequest: request.a,
  }
}

export { PairingIntentData }
export default { compress, decompress }
