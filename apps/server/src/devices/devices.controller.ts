import {
  putDevice as putDeviceFromService,
  postDevice as postDeviceFromService,
  pushNotificationToDevice as pushNotificationToDeviceFromService,
} from './devices.service.js'
import express from 'express'
import {
  setResponse,
  makeApiResponse,
  makeControllerError,
} from '../core/utils.js'
import {
  APIDeviceRegistrationRequest,
  APIDeviceRegistrationResponse,
  APIDeviceUpdateRequest,
  APIDeviceUpdateResponse,
  APIPushAuthenticationRequest,
  APIPushAuthenticationResponse,
} from '@novauth/common'

async function putDevice(
  req: express.Request<any, any, APIDeviceUpdateRequest>,
  res: express.Response,
  next: express.NextFunction
): Promise<express.Response<APIDeviceUpdateResponse> | undefined> {
  try {
    const result = await putDeviceFromService(req.body.action, {
      deviceId: req.params.deviceId,
      pairing: req.body.pairing,
    })
    /* eslint-disable no-fallthrough */
    switch (result.result) {
      case 'OK_PAIRED':
        return setResponse(
          res,
          makeApiResponse(200, 'Device Pairing initiated', result.data)
        )
      case 'OK_PAIRING_UPDATED':
        return setResponse(
          res,
          makeApiResponse(200, 'Device Pairing status updated', result.data)
        )
      case 'ERROR_WRONG_ACTION':
        next(makeControllerError(null, 400, 'An invalid action was supplied'))
        break
    }
    /* eslint-enable no-fallthrough */
  } catch (error) {
    console.log(error)
    next(
      makeControllerError(
        null,
        500,
        'Something went wrong while updating the device'
      )
    )
  }
}

async function postDevice(
  req: express.Request<any, any, APIDeviceRegistrationRequest>,
  res: express.Response<APIDeviceRegistrationResponse>,
  next: express.NextFunction
): Promise<express.Response | undefined> {
  try {
    const result = await postDeviceFromService(req.body.device)
    /* eslint-disable no-fallthrough */
    switch (result.result) {
      case 'OK_CREATED':
        return setResponse(
          res,
          makeApiResponse(
            201,
            'Device successfully created and paired',
            result.data
          )
        )
      case 'ERROR_DEVICE_ALREADY_EXISTS':
        next(
          makeControllerError(
            res,
            400,
            'A device with the provided push token already exists'
          )
        )
        break
    }
    /* eslint-enable no-fallthrough */
  } catch (error) {
    console.log(error)
    next(
      makeControllerError(
        null,
        500,
        'Something went wrong while updating the device'
      )
    )
  }
}

async function pushNotificationToDevice(
  req: express.Request,
  res: express.Response<APIPushAuthenticationResponse>,
  next: express.NextFunction
): Promise<express.Response<APIPushAuthenticationResponse> | undefined> {
  const body: APIPushAuthenticationRequest = req.body
  const result = await pushNotificationToDeviceFromService(
    req.params.deviceId,
    body.payload
  )
  /* eslint-disable no-fallthrough */
  switch (result.result) {
    case 'OK_SENT':
      return setResponse(
        res,
        makeApiResponse(200, 'Notification sent', result.data)
      )
    default:
      next(
        makeControllerError(
          null,
          500,
          'Something went wrong while pushing the notification'
        )
      )
      break
  }
  /* eslint-enable no-fallthrough */
}

export { putDevice, postDevice, pushNotificationToDevice }
