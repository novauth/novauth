import AppModel, { makeApp, App, addToken } from './apps.model'

/**
 * The App type used when creating or updating a new app
 */
type AppInput = Omit<App, '_id' | 'id' | 'token'>

/**
 * The App type returned during normal interaction.
 */
type AppOutput = Omit<App, '_id' | 'token'>

/**
 * The App type returned exclusively when creating a new app.
 */
type AppCreateOutput = AppOutput & { token: string }

/**
 * Prepares an item to be returned by the API.
 * Removes any private fields and merges fields not included in the model.
 * @param app
 * @returns
 */
function makeAppForResponse(app: App): AppOutput {
  return {
    id: app.id,
    origin: app.origin,
  }
}

async function getApp(id: string): Promise<AppOutput | null> {
  const app = await AppModel.findOne().byId(id).exec()
  if (app !== null) {
    return makeAppForResponse(app)
  }
  return null
}

/**
 * Internal function not meant to be exported for creating an app on the db.
 * @param data
 * @returns
 */
async function createApp(data: AppInput): Promise<AppCreateOutput> {
  const app = await makeApp(data)
  const token = await addToken(app)

  await AppModel.create(app)
  return { ...makeAppForResponse(app), token }
}

export { createApp, getApp, AppOutput, AppCreateOutput }
