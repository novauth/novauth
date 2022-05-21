import { AttestationResult } from 'fido2-lib'
import { DeviceID } from '../Pairing'
import { OperationID } from '../Operation'

interface PairingResponse {
  operationID: OperationID
  id: DeviceID
  credential: AttestationResult
}

export default PairingResponse
