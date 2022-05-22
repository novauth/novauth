import DeviceModel, { makeDevice, Device } from './devices.model'

type DeviceCreateInput = Omit<Device, '_id' | 'id'>

/**
 * The Device type returned during normal interaction.
 */
type DeviceOutput = Omit<Device, '_id' | 'expoPushToken'>

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
async function createDevice(
  data: DeviceCreateInput
): Promise<DeviceCreateOutput> {
  const device = await makeDevice(data)

  await DeviceModel.create()
  return { ...makeDeviceForResponse(device) }
}

export {
  createDevice,
  getDevice,
  DeviceCreateInput,
  DeviceOutput,
  DeviceCreateOutput,
}
