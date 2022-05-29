import { PairingResponse } from '../pairing'

interface AppAPIPairingResultRequest {
  type: 'pair_result'
  data: PairingResponse
}
export default AppAPIPairingResultRequest
