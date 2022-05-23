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

export default Pairing
export { DeviceID }
