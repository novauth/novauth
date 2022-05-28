import { AttestationResult } from 'fido2-lib'
import DeviceID from '../devices/DeviceID.js'
import { OperationID } from '../Operation.js'

interface PairingResponse {
  operationID: OperationID
  deviceId: DeviceID
  credential: AttestationResult
}

export default PairingResponse
