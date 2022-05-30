import mongoose from 'mongoose'
import type { Query, Document, Model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { Pairing, DeviceID } from '@novauth/common'

/**
 * The Device type used in the data model
 */
interface Device {
  // the id is present when querying the db but not when creating new documents
  _id?: string
  id: DeviceID // id exposed by the api
  expoPushToken: string
  pairings: Pairing[]
}

const schema = new mongoose.Schema<
  Device,
  Model<Device, DeviceQueryHelpers>,
  any,
  any
>({
  id: { type: String, required: true },
  expoPushToken: { type: String, required: true },
  pairings: [
    new mongoose.Schema({
      status: { type: String, required: true },
      appId: { type: String, required: true },
      userId: { type: String, required: true },
    }),
  ],
})

interface DeviceQueryHelpers {
  byId(id: string): Query<any, Document<Device>> & DeviceQueryHelpers
}

schema.query.byId = function (
  id: string
): Query<any, Document<Device>> & DeviceQueryHelpers {
  return this.findOne({ id })
}

// 2nd param to `model()` is the Model class to return.
const model = mongoose.model<Device, Model<Device, DeviceQueryHelpers>>(
  'Device',
  schema
)

/**
 * Creates a new Device object with the given Device data. Initializes fields to their default values if no value is provided.
 * @param data Device data to initialize the new Device with
 * @returns the Device object correctly initialized
 */
async function makeDevice(data: {
  _id?: string
  expoPushToken: string
  pairings?: Pairing[]
}): Promise<Device> {
  const Device = {
    _id: data._id, // if not present will be init by mongoose
    id: uuidv4(),
    expoPushToken: data.expoPushToken,
    pairings: data.pairings ?? [],
  }
  return Device
}

export default model
export { Device, makeDevice }
