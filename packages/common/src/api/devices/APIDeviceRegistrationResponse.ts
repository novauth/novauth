import { DeviceID } from '../../devices/index.js'
import APIResponse from '../base/APIResponse.js'

interface APIDeviceRegistrationResponseData {
  deviceId: DeviceID
}

type APIDeviceRegistrationResponse =
  APIResponse<APIDeviceRegistrationResponseData>

export default APIDeviceRegistrationResponse
