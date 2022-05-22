import mongoose, { Model, Schema, Query, Document } from 'mongoose'
import uuid from 'uuid'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

/**
 * The App type used in the data model
 */
interface App {
  // the id is present when querying the db but not when creating new documents
  _id?: string
  id: string // id exposed by the api
  token?: string
  origin: string
}

const schema = new Schema<App, Model<App, AppQueryHelpers>, any, any>({
  id: { type: String, required: true },
  token: { type: String, required: false },
  origin: { type: String, required: true },
})

interface AppQueryHelpers {
  byId(id: string): Query<any, Document<App>> & AppQueryHelpers
}

schema.query.byId = function (
  id: string
): Query<any, Document<App>> & AppQueryHelpers {
  return this.find({ id })
}

// 2nd param to `model()` is the Model class to return.
const model = mongoose.model<App, Model<App, AppQueryHelpers>>('App', schema)

/**
 * Creates a new App object with the given App data. Initializes fields to their default values if no value is provided.
 * @param data App data to initialize the new App with
 * @returns the App object correctly initialized
 */
async function makeApp(data: { _id?: string; origin: string }): Promise<App> {
  const App = {
    _id: data._id, // if not present will be init by mongoose
    id: uuid.v4(),
    origin: data.origin,
  }
  return App
}

/**
 * Generate and add token to an app
 * @param app the app to add the token to. The token is safely stored as a hash
 * @returns the unencrypted token added to the app
 */
async function addToken(app: App): Promise<string> {
  const token = crypto.randomBytes(16).toString('hex')
  app.token = await bcrypt.hash(token, 10)
  return token
}

async function isToken(app: App, token: string): Promise<boolean> {
  return await bcrypt.compare(token, app.token ?? '')
}

export default model
export { App, makeApp, addToken, isToken }
