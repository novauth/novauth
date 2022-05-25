import { DeviceID, Pairing } from '../../devices'
import APIResponse from '../base/APIResponse'

interface APIDeviceUpdateResponseData {
  deviceId: DeviceID
  pairing: Pairing
}

type APIPairingUpdateResponse = APIResponse<APIDeviceUpdateResponseData>

export default APIPairingUpdateResponse
