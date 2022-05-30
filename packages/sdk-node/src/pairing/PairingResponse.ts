import { AttestationResult } from 'fido2-lib'
import { DeviceID } from './Pairing.js'
import { OperationID } from '@novauth/common'

interface PairingResponse {
  operationID: OperationID
  deviceId: DeviceID
  credential: AttestationResult
}

export default PairingResponse
