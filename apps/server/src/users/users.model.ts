import mongoose from 'mongoose'
import type { Query, Document, Model } from 'mongoose'
import bcrypt from 'bcrypt'

/**
 * The User type used in the data model
 */
interface User {
  // the id is present when querying the db but not when creating new documents
  _id?: string
  email: string
  password: string
  apps: string[] // list of ids the user is owner of
}

async function setPassword(user: User, password: string): Promise<void> {
  user.password = await bcrypt.hash(password, 10)
}

async function isPassword(user: User, password: string): Promise<boolean> {
  return await bcrypt.compare(password, user.password)
}

const schema = new mongoose.Schema<User, Model<User, UserQueryHelpers>, any, any>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
})

interface UserQueryHelpers {
  byEmail(email: string): Query<any, Document<User>> & UserQueryHelpers
}

schema.query.byEmail = function (
  email: string
): Query<any, Document<User>> & UserQueryHelpers {
  return this.findOne({ email })
}

// 2nd param to `model()` is the Model class to return.
const model = mongoose.model<User, Model<User, UserQueryHelpers>>(
  'User',
  schema
)

/**
 * Creates a new User object with the given user data. Initializes fields to their default values if no value is provided.
 * @param data user data to initialize the new user with
 * @returns the User object correctly initialized
 */
async function makeUser(data: {
  _id?: string
  email: string
  password: string
  apps?: string[] 
}): Promise<User> {
  const user = {
    _id: data._id, // if not present will be init by mongoose
    email: data.email,
    password: data.password, // set with setPassword if defined,
    apps: data.apps ?? [],
  }
  if (data.password !== undefined) await setPassword(user, data.password)
  return user
}

export default model
export { User, setPassword, isPassword, makeUser }
