type DeviceID = string

interface Pairing {
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
