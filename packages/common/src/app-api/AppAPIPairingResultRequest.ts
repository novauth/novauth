import { PairingResponse } from '../pairing/index.js'
import {
  deserializePairingResponse,
  SerializedPairingResponse,
  serializePairingResponse,
} from '../pairing/PairingResponse.js'

interface AppAPIPairingResultRequest {
  type: 'pair_result'
  data: PairingResponse
}

interface SerializedAppAPIPairingResultRequest {
  type: 'pair_result'
  data: SerializedPairingResponse
}

function serializeAppAPIPairingResultRequest(
  a: AppAPIPairingResultRequest
): SerializedAppAPIPairingResultRequest {
  return {
    type: a.type,
    data: serializePairingResponse(a.data),
  }
}

function deserializeAppAPIPairingResultRequest(
  s: SerializedAppAPIPairingResultRequest
): AppAPIPairingResultRequest {
  return {
    type: s.type,
    data: deserializePairingResponse(s.data),
  }
}

export default AppAPIPairingResultRequest
export {
  SerializedAppAPIPairingResultRequest,
  serializeAppAPIPairingResultRequest,
  deserializeAppAPIPairingResultRequest,
}
