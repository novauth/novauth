import DeviceModel, {
  makeDevice,
  Device,
  Pairing,
  PairingStatus,
} from './devices.model'

type DeviceCreateInput = Omit<Device, '_id' | 'id'>

/**
 * The Device type returned during normal interaction.
 */
type DeviceOutput = Omit<Device, '_id' | 'expoPushToken' | 'pairings'>

/**
 * The Device type returned exclusively when creating a new device.
 */
type DeviceCreateOutput = DeviceOutput

/**
 * Prepares an item to be returned by the API.
 * Removes any private fields and merges fields not included in the model.
 * @param device
 * @returns
 */
function makeDeviceForResponse(device: Device): DeviceOutput {
  return {
    id: device.id,
  }
}

async function getDevice(id: string): Promise<DeviceOutput | null> {
  const device = await DeviceModel.findOne().byId(id).exec()
  if (device !== null) {
    return makeDeviceForResponse(device)
  }
  return null
}

/**
 * Internal function not meant to be exported for creating an device on the db.
 * @param data
 * @returns
 */
async function createDevice(data: DeviceCreateInput): Promise<Device> {
  const item = await makeDevice(data)

  await DeviceModel.create(item)
  return item
}

async function addPairing(deviceId: string, pairing: Pairing) {
  await DeviceModel.updateOne(
    { id: deviceId },
    { $addToSet: { pairings: [pairing] } }
  )
}

async function updatePairingStatus(
  deviceId: string,
  appId: string,
  userId: string,
  status: PairingStatus
): Promise<Pairing> {
  await DeviceModel.findOneAndUpdate(
    { id: deviceId },
    { $set: { 'pairings.$[element]': { appId, userId, status } } },
    { arrayFilters: [{ element: { appId, userId } }] }
  )
  return {
    appId,
    userId,
    status,
  }
}

async function putDevice(
  action: string,
  { device, pairing }: any
): Promise<ResultPutDevice> {
  const deviceItem = await DeviceModel.findOne().byId(device.id).exec()

  /* eslint-disable no-fallthrough */
  switch (action) {
    case 'pair': {
      // the request only includes the pairing of the device with the provided app
      const pairingItem: Pairing = {
        status: 'PENDING',
        appId: pairing.appId,
        userId: pairing.userId,
      }
      await addPairing(device.id, pairing)
      return {
        result: 'OK_PAIRED',
        data: {
          pairing: pairingItem,
        },
      }
    }
    case 'pair_confirm': {
      // confirm a pairing: this is done by the app server upon receiving the registration confirmation from the authenticator
      const pairingItem = await updatePairingStatus(
        device.id,
        pairing.appId,
        pairing.userId,
        'CONFIRMED'
      )
      return {
        result: 'OK_PAIRING_UPDATED',
        data: {
          pairing: pairingItem,
        },
      }
    }
    case 'pair_verify': {
      // verify a pairing: this is done by the app server after having verified the first push authentication from the authenticator
      const pairingItem = await updatePairingStatus(
        device.id,
        pairing.appId,
        pairing.userId,
        'VERIFIED'
      )
      return {
        result: 'OK_PAIRING_UPDATED',
        data: {
          pairing: pairingItem,
        },
      }
    }
    default:
      return { result: 'ERROR_WRONG_ACTION' }
  }
  /* eslint-enable no-fallthrough */
}

async function postDevice({ device, pairing }: any): Promise<ResultPostDevice> {
  // the request includes both device creation and pairing of the device with an app
  // the request does not contain a device id
  const deviceItem = DeviceModel.findOne({
    expoPushToken: device.expoPushToken,
  })
  const pairingItem: Pairing = {
    status: 'PENDING',
    appId: pairing.appId,
    userId: pairing.userId,
  }
  if (deviceItem !== null) return { result: 'ERROR_DEVICE_ALREADY_EXISTS' }
  else {
    // create device, storing the provided access token

    const deviceItem = await createDevice({
      expoPushToken: device.expoPushToken,
      pairings: [pairingItem],
    })
    // return the pairing information
    return {
      result: 'OK_CREATED_AND_PAIRED',
      data: {
        deviceId: deviceItem.id,
        pairing: pairingItem,
      },
    }
  }
}

type ResultPostDevice =
  | {
      result: 'OK_CREATED_AND_PAIRED'
      data: {
        deviceId: string
        pairing: Pairing
      }
    }
  | {
      result: 'ERROR_WRONG_ACTION' | 'ERROR_DEVICE_ALREADY_EXISTS'
    }

type ResultPutDevice =
  | {
      result: 'OK_PAIRED' | 'OK_PAIRING_UPDATED'
      data: {
        pairing: Pairing
      }
    }
  | {
      result: 'ERROR_WRONG_ACTION'
    }

export {
  createDevice,
  getDevice,
  postDevice,
  putDevice,
  DeviceCreateInput,
  DeviceOutput,
  DeviceCreateOutput,
}