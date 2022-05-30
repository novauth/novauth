import { base64encode } from '@novauth/common'

type DeviceID = string

/**
 * The status of a pairing. Note that the pairing cannot be in the 'pending' state from the server perspective
 */
type PairingStatus = 'confirmed' | 'verified' | 'confirm_pending'

interface Pairing {
  status: PairingStatus
  userID: string
  device: {
    id: DeviceID
  }
  credential: {
    id: string
    counter: number
    publicKey: string
  }
}

function Pairing(
  status: PairingStatus,
  userID: string,
  device: {
    id: DeviceID
  },
  credential: {
    id: Buffer
    counter: number
    publicKey: string
  }
): Pairing {
  return {
    status,
    userID,
    device,
    credential: {
      id: base64encode(credential.id),
      counter: credential.counter,
      publicKey: credential.publicKey,
    },
  }
}

export default Pairing
export { DeviceID }
