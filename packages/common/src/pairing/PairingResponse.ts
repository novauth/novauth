import { AttestationResult } from 'fido2-lib'
import DeviceID from '../devices/DeviceID.js'
import { OperationID } from '../Operation.js'
import { base64decode, base64encode } from '../utils.js'
import { Buffer } from 'buffer'

interface PairingResponse {
  operationID: OperationID
  deviceId: DeviceID
  credential: AttestationResult
}

interface SerializedAttestationResult {
  id?: string
  rawId?: string
  transports?: string[]
  response: { clientDataJSON: string; attestationObject: string }
}

interface SerializedPairingResponse {
  operationID: OperationID
  deviceId: DeviceID
  credential: SerializedAttestationResult
}

function serializePairingResponse(
  a: PairingResponse
): SerializedPairingResponse {
  return {
    operationID: a.operationID,
    deviceId: a.deviceId,
    credential: serializeAttestationResult(a.credential),
  }
}

function deserializePairingResponse(
  s: SerializedPairingResponse
): PairingResponse {
  return {
    operationID: s.operationID,
    deviceId: s.deviceId,
    credential: deserializeAttestationResult(s.credential),
  }
}

function serializeAttestationResult(
  a: AttestationResult
): SerializedAttestationResult {
  return {
    id: a.id ? base64encode(Buffer.from(a.id)) : undefined,
    rawId: a.rawId ? base64encode(Buffer.from(a.rawId)) : undefined,
    response: a.response,
    transports: a.transports,
  }
}

function deserializeAttestationResult(
  s: SerializedAttestationResult
): AttestationResult {
  return {
    id: s.id ? base64decode(s.id) : undefined,
    rawId: s.rawId ? base64decode(s.rawId) : undefined,
    response: s.response,
    transports: s.transports,
  }
}

export default PairingResponse
export {
  SerializedPairingResponse,
  serializePairingResponse,
  deserializePairingResponse,
}
