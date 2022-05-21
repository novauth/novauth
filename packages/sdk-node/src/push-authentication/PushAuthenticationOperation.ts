import Operation from '../Operation'
import Pairing from '../pairing/Pairing'

interface PushAuthenticationOperation
  extends Operation<{
    challenge: string
    pairing: Pairing
  }> {
  type: 'push-auth'
}

function PushAuthenticationOperation(
  challenge: string,
  pairing: Pairing
): PushAuthenticationOperation {
  return { ...Operation({ challenge, pairing }), type: 'push-auth' }
}

export default PushAuthenticationOperation
