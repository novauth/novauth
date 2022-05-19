import {
  AndroidConfig,
  ConfigPlugin,
  withAndroidManifest,
  withStringsXml,
} from '@expo/config-plugins'
import { ExpoConfig } from '@expo/config-types'

const { addMetaDataItemToMainApplication, getMainApplicationOrThrow } =
  AndroidConfig.Manifest
const { setStringItem } = AndroidConfig.Strings

async function setCustomAssetStatements(
  config: Pick<ExpoConfig, 'android'>,
  androidManifest: AndroidConfig.Manifest.AndroidManifest
): Promise<AndroidConfig.Manifest.AndroidManifest> {
  // Get the <application /> tag and assert if it doesn't exist.
  const mainApplication = getMainApplicationOrThrow(androidManifest)

  addMetaDataItemToMainApplication(
    mainApplication,
    'asset_statements',
    '@string/asset_statements',
    'resource'
  )

  return androidManifest
}

const withAssetStatementMetadata: ConfigPlugin = (config) => {
  return withAndroidManifest(config, async (config) => {
    config.modResults = await setCustomAssetStatements(config, config.modResults)
    return config
  })
}

const withAssetStatementsStringResource: ConfigPlugin = (config) => {
  return withStringsXml(config, async (config) => {
    config.modResults = await setStringItem(
      [
        {
          $: {
            name: 'asset_statements',
            translatable: 'false',
          },
          _: `[{
        \\\"include\\\": \\\"${process.env.NOVAUTH_SERVER_BASE_URL}/.well-known/assetlinks.json\\\"
      }]`,
        },
      ],
      config.modResults
    )
    return config
  })
}

export default {
  name: 'Authenticator',
  slug: 'authenticator',
  owner: 'novauth',
  version: '0.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF',
    },
    package: 'com.novauth.authenticator',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [withAssetStatementMetadata, withAssetStatementsStringResource],
}
