import { DeviceID } from '../../devices/index.js'
import { Pairing } from '../../pairing/index.js'
import APIResponse from '../base/APIResponse.js'

interface APIDeviceUpdateResponseData {
  deviceId: DeviceID
  pairing: Pairing
}

type APIPairingUpdateResponse = APIResponse<APIDeviceUpdateResponseData>

export default APIPairingUpdateResponse
