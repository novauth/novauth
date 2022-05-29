import { DeviceID } from '../../devices'
import APIResponse from '../base/APIResponse'

interface APIDeviceRegistrationResponseData {
  deviceId: DeviceID
}

type APIDeviceRegistrationResponse =
  APIResponse<APIDeviceRegistrationResponseData>

export default APIDeviceRegistrationResponse
