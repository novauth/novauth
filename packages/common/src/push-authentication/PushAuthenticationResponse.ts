import { AssertionResult } from 'fido2-lib'
import { OperationID } from '../Operation.js'
import DeviceID from '../devices/DeviceID.js'

interface PushAuthenticationResponse {
  operationId: OperationID
  id: DeviceID
  credential: AssertionResult
}

export default PushAuthenticationResponse
