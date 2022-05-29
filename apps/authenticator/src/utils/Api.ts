import Constants from 'expo-constants'
import axios, { AxiosResponse } from 'axios'
import {
  APIDeviceRegistrationRequest,
  APIDeviceRegistrationResponse,
  APIDeviceUpdateRequest,
  APIDeviceUpdateResponse,
  APIError,
  DeviceID,
  isErrorStatus,
} from '@novauth/common'

let API_URL = ''

async function init() {
  if (Constants.manifest?.extra?.API_URL)
    API_URL = Constants.manifest.extra.API_URL
  else throw 'Error initializing NovAuth API: cannot find API URL'
}

/**
 * Register the device on the NovAuth API
 * @param expoPushToken
 */
async function registerDevice(expoPushToken: string) {
  const response = await axios.post<
    any,
    AxiosResponse<APIDeviceRegistrationResponse | APIError>,
    APIDeviceRegistrationRequest
  >(`${API_URL}/devices`, { device: { expoPushToken } })
  if (isErrorStatus(response.data.status))
    throw 'API Error: Cannot register the device.'
  else return (response.data as APIDeviceRegistrationResponse).data
}

async function pairDevice(deviceId: DeviceID, appId: string, userId: string) {
  const response = await axios.put<
    any,
    AxiosResponse<APIDeviceUpdateResponse | APIError>,
    APIDeviceUpdateRequest
  >(`${API_URL}/devices/${deviceId}`, {
    action: 'pair',
    pairing: { appId, userId },
  })
  if (isErrorStatus(response.data.status))
    throw 'API Error: Cannot pair the device.'
  else return (response.data as APIDeviceUpdateResponse).data
}

export default { init, registerDevice, pairDevice }
