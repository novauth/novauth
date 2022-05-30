import {Operation} from '@novauth/common'

interface PairingOperation
  extends Operation<{ userId: string; challenge: string }> {
  type: 'pairing'
}

function PairingOperation(userId: string, challenge: string): PairingOperation {
  return { ...Operation({ userId, challenge }), type: 'pairing' }
}

export default PairingOperation
