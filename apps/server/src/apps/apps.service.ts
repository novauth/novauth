import AppModel, { makeApp, App, addToken } from './apps.model.js'
import fs from 'fs'
import path from 'path'

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
 * Internal function not meant to perform all the operations to create an app on the system.
 * @param data
 * @returns
 */
async function createApp(data: AppInput): Promise<AppCreateOutput> {
  const app = await makeApp(data)
  const token = await addToken(app)

  await AppModel.create(app)
  await generateAssetLinksFile()
  return { ...makeAppForResponse(app), token }
}

/**
 * Generate digital asset file with the currently registered apps and stores it on the filesystem
 * @param app
 */
async function generateAssetLinksFile() {
  const apps = await AppModel.find()
  const assetlinksFile = []
  apps.forEach((element) => {
    assetlinksFile.push({
      relation: [
        'delegate_permission/common.handle_all_urls',
        'delegate_permission/common.get_login_creds',
      ],
      target: {
        namespace: 'web',
        site: element.origin,
      },
    })
  })
  assetlinksFile.push({
    relation: [
      'delegate_permission/common.handle_all_urls',
      'delegate_permission/common.get_login_creds',
    ],
    target: {
      namespace: 'android_app',
      package_name: process.env.APP_ANDROID_PACKAGE,
      sha256_cert_fingerprints: [process.env.APP_ANDROID_FINGERPRINT],
    },
  })
  await fs.promises.writeFile(
    path.join('./public/.well-known/assetlinks.json'),
    JSON.stringify(assetlinksFile)
  )
}

export { createApp, getApp, AppOutput, AppCreateOutput, generateAssetLinksFile }
