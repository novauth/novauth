import {
  putDevice as putDeviceFromService,
  postDevice as postDeviceFromService,
  pushNotificationToDevice as pushNotificationToDeviceFromService,
} from './devices.service.js'
import express from 'express'
import { makeError, makeResponse } from '../core/utils.js'

async function putDevice(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<express.Response | undefined> {
  try {
    const result = await putDeviceFromService(req.body.action, {
      deviceId: req.params.deviceId,
      pairing: req.body.pairing,
    })
    /* eslint-disable no-fallthrough */
    switch (result.result) {
      case 'OK_PAIRED':
        return makeResponse(res, 200, 'Device Pairing initiated', result.data)
      case 'OK_PAIRING_UPDATED':
        return makeResponse(
          res,
          200,
          'Device Pairing status updated',
          result.data
        )
      case 'ERROR_WRONG_ACTION':
        next(makeError(null, 400, 'An invalid action was supplied'))
        break
    }
    /* eslint-enable no-fallthrough */
  } catch (error) {
    console.log(error)
    next(makeError(null, 500, 'Something went wrong while updating the device'))
  }
}

async function postDevice(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<express.Response | undefined> {
  try {
    const result = await postDeviceFromService(
      req.body.device,
      req.body.pairing
    )
    /* eslint-disable no-fallthrough */
    switch (result.result) {
      case 'OK_CREATED_AND_PAIRED':
        return makeResponse(
          res,
          201,
          'Device successfully created and paired',
          result.data
        )
      case 'ERROR_DEVICE_ALREADY_EXISTS':
        next(
          makeError(
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
    next(makeError(null, 500, 'Something went wrong while updating the device'))
  }
}

async function pushNotificationToDevice(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<express.Response | undefined> {
  try {
    const result = await pushNotificationToDeviceFromService(
      req.params.deviceId,
      req.body.payload
    )
    /* eslint-disable no-fallthrough */
    switch (result.result) {
      case 'OK_SENT':
        return makeResponse(res, 200, 'Notification sent', result.data)
    }
    /* eslint-enable no-fallthrough */
  } catch (error) {
    console.log(error)
    next(
      makeError(
        null,
        500,
        'Something went wrong while pushing the notification'
      )
    )
  }
}

export { putDevice, postDevice, pushNotificationToDevice }
