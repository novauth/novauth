import { PublicKeyCredentialCreationOptions } from 'fido2-lib'
import { OperationID } from '../Operation.js'

type Version = '0.0.0'

type NotificationProvider = 'novauth'

interface PairingRequest {
  operationId: OperationID
  version: Version
  notificationProvider: NotificationProvider
  origin: string
  webhook: string
  attestationRequest: PublicKeyCredentialCreationOptions
}

interface PairingRequestCompressed {
  i: OperationID
  v: Version
  n: NotificationProvider
  o: string
  w: string
  a: PublicKeyCredentialCreationOptions
}

function compress(request: PairingRequest): PairingRequestCompressed {
  return {
    i: request.operationId,
    v: request.version,
    n: request.notificationProvider,
    o: request.origin,
    w: request.webhook,
    a: request.attestationRequest,
  }
}

function decompress(request: PairingRequestCompressed): PairingRequest {
  return {
    operationId: request.i,
    version: request.v,
    notificationProvider: request.n,
    origin: request.o,
    webhook: request.w,
    attestationRequest: request.a,
  }
}

export { PairingRequest }
export default { compress, decompress }
