import { DeviceID } from '../../devices'
import { Pairing } from '../../pairing'
import APIResponse from '../base/APIResponse'

interface APIDeviceUpdateResponseData {
  deviceId: DeviceID
  pairing: Pairing
}

type APIPairingUpdateResponse = APIResponse<APIDeviceUpdateResponseData>

export default APIPairingUpdateResponse
