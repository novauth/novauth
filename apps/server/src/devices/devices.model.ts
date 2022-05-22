import mongoose, { Model, Schema, Query, Document } from 'mongoose'
import uuid from 'uuid'

type PairingStatus = 'PENDING' | 'CONFIRMED' | 'VERIFIED'

interface Pairing {
  status: PairingStatus
  appId: string
  userId: string
}

/**
 * The Device type used in the data model
 */
interface Device {
  // the id is present when querying the db but not when creating new documents
  _id?: string
  id: string // id exposed by the api
  expoPushToken: string
  pairings: Pairing[]
}

const schema = new Schema<Device, Model<Device, DeviceQueryHelpers>, any, any>({
  id: { type: String, required: true },
  expoPushToken: { type: String, required: true },
})

interface DeviceQueryHelpers {
  byId(id: string): Query<any, Document<Device>> & DeviceQueryHelpers
}

schema.query.byId = function (
  id: string
): Query<any, Document<Device>> & DeviceQueryHelpers {
  return this.find({ id })
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
    id: uuid.v4(),
    expoPushToken: data.expoPushToken,
    pairings: data.pairings ?? [],
  }
  return Device
}

export default model
export { Device, makeDevice, Pairing, PairingStatus }
