import { NativeModules } from 'react-native'
import { base64Decode, base64Encode, checkPlatform } from './utils'

const { RNFido2 } = NativeModules

/**
 * An extension to the standard `PublicKeyCredentialRequestOptions`, with the `rpId` property required,
 * as needed for the Android native FIDO2 API.
 */
interface CustomPublicKeyCredentialRequestOptions
  extends PublicKeyCredentialRequestOptions {
  challenge: BufferSource
}

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
}: PublicKeyCredentialCreationOptions): Promise<
  PublicKeyCredential & { response: AuthenticatorAttestationResponse }
> {
  // Android support only
  checkPlatform()

  try {
    // perform the registration
    const signedData = await RNFido2.registration({
      rp,
      user: {
        id: base64Encode(user.id),
        name: user.name,
        displayName: user.displayName,
      },
      challenge: base64Encode(challenge),
      pubKeyCredParams,
      timeout,
      excludeCredentials: excludeCredentials.map((credentialDescriptor) => {
        return {
          ...credentialDescriptor,
          id: base64Encode(credentialDescriptor.id),
        }
      }),
      authenticatorSelection,
      attestation,
      extensions,
    })
    const parsedSignedData = {
      id: signedData.id,
      rawId: base64Decode(signedData.rawId),
      response: {
        clientDataJSON: base64Decode(signedData.clientDataJSON),
        attestationObject: base64Decode(signedData.attestationObject),
      },
      type: 'public-key',
      getClientExtensionResults: () => {
        // TODO: add support for standard extensions
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
 * @param options the `CustomPublicKeyCredentialRequestOptions` object containing the options for the assertion request, received from the Relying Party
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
}: CustomPublicKeyCredentialRequestOptions): Promise<PublicKeyCredential> {
  // Android support only
  checkPlatform()

  try {
    // perform the signing
    const signedData = await RNFido2.sign({
      challenge: base64Encode(challenge),
      timeout,
      rpId,
      allowCredentials: allowCredentials.map((credentialDescriptor) => {
        return {
          ...credentialDescriptor,
          id: base64Encode(credentialDescriptor.id),
        }
      }),
      extensions,
    })

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
        // TODO: add support for standard extensions
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
