import { Operation } from '@novauth/common'
import Pairing, { SerializedPairing } from '../pairing/Pairing.js'

interface PushAuthenticationOperation
  extends Operation<{
    challenge: string
    pairing: SerializedPairing
  }> {
  type: 'push-auth'
}

function PushAuthenticationOperation(
  challenge: string,
  pairing: SerializedPairing
): PushAuthenticationOperation {
  return { ...Operation({ challenge, pairing }), type: 'push-auth' }
}

export default PushAuthenticationOperation
