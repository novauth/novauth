import { DeviceID } from '../../devices'
import { Pairing } from '../../pairing'
import APIResponse from '../base/APIResponse'

interface APIDeviceRegistrationResponseData {
  deviceId: DeviceID
  pairing: Pairing
}

type APIDeviceRegistrationResponse =
  APIResponse<APIDeviceRegistrationResponseData>

export default APIDeviceRegistrationResponse
