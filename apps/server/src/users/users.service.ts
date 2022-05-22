import UserModel, { makeUser, User } from './users.model'

interface ReducedUser {
  email: string
}

async function makeUserForResponse(user: User): Promise<ReducedUser> {
  return {
    email: user.email,
  }
}

async function getUser(email: string): Promise<ReducedUser | null> {
  const user = await UserModel.findOne().byEmail(email).exec()
  if (user !== null) {
    return await makeUserForResponse(user)
  }
  return null
}

async function createUser(email: string, data: any): Promise<boolean> {
  await UserModel.create(await makeUser({ ...data, email }))
  return true
}

async function putUser(
  action: string,
  email: string,
  data: any
): Promise<ResultPutUser> {
  const user = await UserModel.findOne().byEmail(email).exec()
  /* eslint-disable no-fallthrough */
  switch (action) {
    case 'create':
      if (user !== null) return 'ERROR_USER_ALREADY_EXISTS'
      else {
        await createUser(email, data)
        return 'OK_CREATED'
      }
    default:
      return 'ERROR_WRONG_ACTION'
  }
  /* eslint-enable no-fallthrough */
}

type ResultPutUser =
  | 'OK_CREATED'
  | 'ERROR_USER_ALREADY_EXISTS'
  | 'ERROR_WRONG_ACTION'

export { getUser, putUser, ResultPutUser }
