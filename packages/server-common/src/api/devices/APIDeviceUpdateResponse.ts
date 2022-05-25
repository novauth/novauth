import { DeviceID, Pairing } from '../../devices'
import TypedResponse from '../TypedResponse'

interface APIDeviceUpdateResponseData {
  deviceId: DeviceID
  pairing: Pairing
}

type APIPairingUpdateResponse = TypedResponse<APIDeviceUpdateResponseData>

export default APIPairingUpdateResponse
