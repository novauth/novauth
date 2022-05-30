import { PublicKeyCredentialCreationOptions } from 'fido2-lib'
import { OperationID } from '../Operation.js'

type Version = '0.0.0'

type NotificationProvider = 'novauth'

interface PairingRequest {
  appId: string
  operationId: OperationID
  version: Version
  notificationProvider: NotificationProvider
  origin: string
  webhook: string
  attestationRequest: PublicKeyCredentialCreationOptions
}

interface PairingRequestCompressed {
  p: string
  i: OperationID
  v: Version
  n: NotificationProvider
  o: string
  w: string
  a: PublicKeyCredentialCreationOptions
}

function compress(request: PairingRequest): PairingRequestCompressed {
  return {
    p: request.appId,
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
    appId: request.p,
    operationId: request.i,
    version: request.v,
    notificationProvider: request.n,
    origin: request.o,
    webhook: request.w,
    attestationRequest: request.a,
  }
}

export default PairingRequest
export { compress, decompress, PairingRequestCompressed }
