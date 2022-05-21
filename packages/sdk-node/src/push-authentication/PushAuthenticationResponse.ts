import { AssertionResult } from 'fido2-lib'
import { OperationID } from '../Operation'
import { DeviceID } from '../Pairing'

interface PushAuthenticationResponse {
  operationId: OperationID
  id: DeviceID
  credential: AssertionResult
}

export default PushAuthenticationResponse
