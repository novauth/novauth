import { base64encode, Operation } from '@novauth/common'

interface PairingOperation
  extends Operation<{ userId: string; challenge: string }> {
  type: 'pairing'
}

function PairingOperation(userId: string, challenge: Buffer): PairingOperation {
  return {
    ...Operation({ userId, challenge: base64encode(challenge) }),
    type: 'pairing',
  }
}

export default PairingOperation
