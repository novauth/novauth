import {
  AppCreateOutput,
  AppOutput,
  createApp,
  getApp,
} from '../apps/apps.service'
import UserModel, { makeUser, User } from './users.model'

/**
 * The User type used when interacting with a user
 */
type UserInput = Omit<User, '_id' | 'apps'>

/**
 * The User type specifically used when creating a new user
 */
type UserCreateInput = Omit<User, '_id'>

/**
 * The App type returned during normal interaction.
 */
type UserOutput = Omit<User, '_id' | 'password' | 'apps'> & {
  apps: AppOutput[]
}

/**
 * The User type returned exclusively when creating a new user.
 */
type UserCreateOutput = UserOutput & {
  apps: AppCreateOutput[]
}

/**
 * Prepares an item to be returned by the API.
 * Removes any private fields and merges fields not included in the model.
 * @param user
 * @param apps
 * @returns
 */
function makeUserForResponse(user: User, apps: AppOutput[]): UserOutput {
  return {
    email: user.email,
    apps,
  }
}

async function getUser(email: string): Promise<UserOutput | null> {
  const user = (await UserModel.findOne().byEmail(email).exec()) as User
  if (user !== null) {
    // get apps
    let apps = (
      await Promise.all(user.apps.map(async (appId) => await getApp(appId)))
    ).filter((e) => e !== null) as AppOutput[]
    return makeUserForResponse(user, apps)
  }
  return null
}

/**
 * Internal function not meant to be exported for creating a user on the db.
 * @param email
 * @param data
 * @returns
 */
async function createUser(email: string, data: UserCreateInput): Promise<User> {
  const item = await makeUser({ ...data, email })

  await UserModel.create(item)
  return item
}

async function putUser(
  action: string,
  email: string,
  { user, app }: any
): Promise<ResultPutUser> {
  const userItem = await UserModel.findOne().byEmail(email).exec()
  /* eslint-disable no-fallthrough */
  switch (action) {
    case 'create':
      if (userItem !== null) return { result: 'ERROR_USER_ALREADY_EXISTS' }
      else {
        // create app to associate with user
        const appItem = await createApp(app)
        // create user
        const userItem = await createUser(email, {
          ...user,
          apps: [appItem.id],
        })
        return {
          result: 'OK_CREATED',
          data: {
            user: {
              ...makeUserForResponse(userItem, [appItem]),
              apps: [appItem],
            },
          },
        }
      }
    default:
      return { result: 'ERROR_WRONG_ACTION' }
  }
  /* eslint-enable no-fallthrough */
}

type ResultPutUser =
  | {
      result: 'OK_CREATED'
      data: { user: UserCreateOutput }
    }
  | {
      result: 'ERROR_USER_ALREADY_EXISTS' | 'ERROR_WRONG_ACTION'
    }

export { getUser, putUser, ResultPutUser }
