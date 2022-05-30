import { base64decode, base64encode } from '@novauth/common'

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
    id: ArrayBuffer
    counter: number
    publicKey: string
  }
}

interface SerializedPairing {
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

function serializePairing(a: Pairing): SerializedPairing {
  return {
    status: a.status,
    userID: a.userID,
    device: a.device,
    credential: {
      id: base64encode(a.credential.id),
      counter: a.credential.counter,
      publicKey: a.credential.publicKey,
    },
  }
}

function deserializePairing(s: SerializedPairing): Pairing {
  return {
    status: s.status,
    userID: s.userID,
    device: s.device,
    credential: {
      id: base64decode(s.credential.id),
      counter: s.credential.counter,
      publicKey: s.credential.publicKey,
    },
  }
}

export default Pairing
export { SerializedPairing, serializePairing, deserializePairing }
export { DeviceID }
