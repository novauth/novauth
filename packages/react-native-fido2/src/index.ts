import { NativeModules } from 'react-native'
import { base64Decode, base64Encode, checkPlatform } from './utils'

const { RNFido2 } = NativeModules

/**
 * Request an Attestation - equivalent to the Credential Management API [`navigator.credentials.create()`](https://w3c.github.io/webappsec-credential-management/#dom-credentialscontainer-create) operation, with the `publicKey` option.
 * This procedure is used during the [Registration Ceremony](https://w3c.github.io/webauthn/#registration-ceremony) to generate a new public key credential.
 * @param options the `PublicKeyCredentialCreationOptions` object containing the options for the registration, received from the Relying Party
 * @returns the `PublicKeyCredential` object returned by the Authenticator, containing the Attestation Response
 * @throws error if something goes wrong during the registration procedure
 */
async function attestationRequest({
  rp,
  user,
  challenge,
  pubKeyCredParams,
  timeout,
  excludeCredentials = [],
  authenticatorSelection,
  attestation = 'none',
  extensions = {},
}: PublicKeyCredentialCreationOptions): Promise<PublicKeyCredential> {
  // Android support only
  checkPlatform()

  authenticatorSelection = {
    requireResidentKey: false,
    userVerification: 'preferred',
    ...authenticatorSelection,
  }

  try {
    // Set up the native module
    await RNFido2.setRpId(rp.id, rp.name, '')
    await RNFido2.setUser(
      base64Encode(user.id),
      user.name,
      '',
      user.displayName
    )
    if (extensions?.appid !== undefined)
      await RNFido2.setAppId(extensions.appid)

    // parse options and add defaults
    const parsedOptions = {
      timeout: timeout,
      requireResidentKey: authenticatorSelection.requireResidentKey,
      residentKey: authenticatorSelection.residentKey,
      attestationPreference: attestation,
      userVerification: authenticatorSelection.userVerification,
      authenticatorType:
        authenticatorSelection?.authenticatorAttachment ?? 'any',
    }

    // perform the registration
    const signedData = await RNFido2.registerFido2(
      excludeCredentials
        ? excludeCredentials.map((credentialDescriptor) => {
            return {
              ...credentialDescriptor,
              id: base64Encode(credentialDescriptor.id),
            }
          })
        : [],
      base64Encode(challenge),
      pubKeyCredParams,
      parsedOptions
    )

    const parsedSignedData = {
      id: signedData.id,
      rawId: base64Decode(signedData.rawId),
      response: {
        clientDataJSON: base64Decode(signedData.clientDataJSON),
        attestationObject: base64Decode(signedData.attestationObject),
      },
      type: 'public-key',
      getClientExtensionResults: () => {
        // TODO: add support for standard extensionss
        return {}
      },
    }
    return parsedSignedData
  } catch (err) {
    console.error('Something went wrong during the attestation request!')
    console.error(err)
    throw err
  }
}

/**
 * Request an Authentication Assertion - equivalent to the Credential Management API [`navigator.credentials.get()`](https://w3c.github.io/webappsec-credential-management/#dom-credentialscontainer-get) operation, with the `publicKey` option.
 * This procedure is used during an [Authentication Ceremony](https://w3c.github.io/webauthn/#authentication-ceremony) to prove possession of the private key associated with one of the provided public key credentials.
 * @param options the `PublicKeyCredentialRequestOptions` object containing the options for the assertion request, received from the Relying Party
 * @returns the `PublicKeyCredential` object returned by the Authenticator, containing the Assertion Response
 * @throws error if something goes wrong during the assertion request procedure
 */
async function assertionRequest({
  challenge,
  timeout,
  rpId,
  allowCredentials = [],
  userVerification = 'preferred',
  extensions,
}: PublicKeyCredentialRequestOptions): Promise<PublicKeyCredential> {
  // Android support only
  checkPlatform()
  const parsedOptions = {
    timeout: timeout,
    appId: extensions?.appid !== undefined,
  }
  try {
    if (extensions?.appid !== undefined)
      await RNFido2.setAppId(extensions.appid)

    const signedData = RNFido2.signFido2(
      allowCredentials
        ? allowCredentials.map((credentialDescriptor) => {
            return {
              ...credentialDescriptor,
              id: base64Encode(credentialDescriptor.id),
            }
          })
        : [],
      base64Encode(challenge),
      parsedOptions
    )

    const parsed = {
      id: signedData.id,
      rawId: base64Decode(signedData.rawId),
      response: {
        authenticatorData: base64Decode(signedData.authenticatorData),
        clientDataJSON: base64Decode(signedData.clientDataJSON),
        signature: base64Decode(signedData.signature),
        userHandle: signedData.userHandle
          ? base64Decode(signedData.userHandle)
          : undefined,
      },
      getClientExtensionResults: () => {
        // TODO: add support for standard extensionss
        return {}
      },
      type: 'public-key',
    }
    return parsed
  } catch (err) {
    console.error('Something went wrong during the assertion request!')
    console.error(err)
    throw err
  }
}

export { assertionRequest, attestationRequest }
