import { PairingResponse } from '../pairing/index.js'

interface AppAPIPairingResultRequest {
  type: 'pair_result'
  data: PairingResponse
}
export default AppAPIPairingResultRequest
