// TODO: full module documentation
import { Fido2Lib } from 'fido2-lib'
import QRCode from 'qrcode'
import PairingIntent from './pairing/PairingIntent.js'
import {
  base64decode,
  base64decodestring,
  base64encode,
  base64encodestring,
  compress,
  deserializePairingResponse,
  PairingResponse,
  SerializedPairingResponse,
} from '@novauth/common'
import { PushAuthenticationResponse } from '@novauth/common'
import PushAuthenticationIntent from './push-authentication/PushAuthenticationIntent.js'
import PairingOperation from './pairing/PairingOperation.js'
import PushAuthenticationOperation from './push-authentication/PushAuthenticationOperation.js'
import Pairing, {
  SerializedPairing,
  serializePairing,
} from './pairing/Pairing.js'
import User from './User.js'
import axios from 'axios'
import {
  APIDeviceUpdateRequest,
  APIDeviceUpdateResponse,
  APIPushAuthenticationRequest,
} from '@novauth/common'
import base64url from 'base64url'

interface NovAuthSDKOptions {
  app: {
    id: string
    domain: string
    origin: string
    webhook: string
    name: string
    iconUrl?: string
  }
  authenticator: 'device' | 'external' | 'any'
}

class NovAuthSDK {
  private readonly NOVAUTH_API_URL = 'https://novauth.herokuapp.com'
  private readonly VERSION = '0.0.0'
  private readonly NOTIFICATION_PROVIDER = 'novauth'

  private readonly TIMEOUT_SECONDS = 600
  private readonly CHALLENGE_SIZE = 128
  private readonly REQUIRE_RESIDENT_KEY = false
  private readonly USER_VERIFICATION = 'required'
  private readonly ATTESTATION = 'none'
  private readonly CRYPTO_PARAMS = [-7, -257]

  private readonly apiToken: string
  private readonly options: NovAuthSDKOptions
  private readonly f2l: Fido2Lib

  constructor(apiToken: string, options: NovAuthSDKOptions) {
    // TODO: input validation
    this.apiToken = apiToken
    this.options = options

    const authenticatorAttachment =
      options.authenticator === 'device'
        ? 'platform'
        : options.authenticator === 'external'
        ? 'cross-platform'
        : undefined

    this.f2l = new Fido2Lib({
      timeout: this.TIMEOUT_SECONDS,
      rpId: options.app.domain,
      rpName: options.app.name,
      rpIcon: options.app.iconUrl,
      challengeSize: this.CHALLENGE_SIZE,
      attestation: this.ATTESTATION,
      cryptoParams: this.CRYPTO_PARAMS,
      authenticatorAttachment: authenticatorAttachment,
      authenticatorRequireResidentKey: this.REQUIRE_RESIDENT_KEY,
      authenticatorUserVerification: this.USER_VERIFICATION,
    })
  }

  /**
   * Prepare for the pairing process
   * @param user
   * @returns
   */
  public async pairingIntent(user: User): Promise<PairingIntent> {
    try {
      const registrationOptions = await this.f2l.attestationOptions()
      registrationOptions.user = {
        id: user.id,
        name: user.name,
        displayName: user.displayName,
      }

      const operation = PairingOperation(
        user.id,
        Buffer.from(registrationOptions.challenge)
      )
      return {
        operation,
        qrCode: await QRCode.toDataURL(
          JSON.stringify(
            compress({
              appId: this.options.app.id,
              operationId: operation.id,
              version: this.VERSION,
              notificationProvider: this.NOTIFICATION_PROVIDER,
              origin: this.options.app.origin,
              webhook: this.options.app.webhook,
              attestationRequest: registrationOptions,
            })
          )
        ),
      }
    } catch (err) {
      throw 'The pairing cannot be initiated: ' + err
    }
  }

  /**
   * Verify a pairing
   * @param id
   * @param response
   * @returns
   */
  public async pairingVerify(
    operation: PairingOperation,
    response: SerializedPairingResponse
  ): Promise<SerializedPairing> {
    try {
      const deserialized = deserializePairingResponse(response)

      // HACK: fix issue with non-compliant fido2-lib code for origin check
      const clientDataJSON = JSON.parse(
        base64decodestring(deserialized.credential.response.clientDataJSON)
      )
      clientDataJSON.origin = this.options.app.origin
      // HACK: fix issue with non-compliant Android Fido2ApiClient not providing the challenge back in the response.
      clientDataJSON.challenge = operation.data.challenge

      // verify pairing
      const regResult = await this.f2l.attestationResult(
        {
          ...deserialized.credential,
          response: {
            clientDataJSON: base64encodestring(JSON.stringify(clientDataJSON)),
            attestationObject:
              deserialized.credential.response.attestationObject,
          },
        },
        {
          rpId: this.options.app.origin,
          challenge: operation.data.challenge,
          origin: this.options.app.origin,
          factor: 'either',
        }
      ) // will throw on error

      const authnrData = regResult.authnrData
      // API: verify pairing
      const data: APIDeviceUpdateRequest = {
        action: 'pair_verify',
        pairing: {
          appId: this.options.app.id,
          userId: operation.data.userId,
        },
      }
      const apiResponse: APIDeviceUpdateResponse = (
        await axios({
          url: `${this.NOVAUTH_API_URL}/devices/${deserialized.deviceId}`,
          method: 'put',
          data,
        })
      ).data

      if (apiResponse.status !== 200)
        throw 'error from the NovAuth API: ' + apiResponse.message

      // return the pairing data
      return serializePairing({
        status: 'verified',
        userID: operation.data.userId,
        device: {
          id: deserialized.deviceId,
        },
        credential: {
          id: authnrData.get('credId'),
          counter: authnrData.get('signCount'),
          publicKey: authnrData.get('credentialPublicKeyPem'),
        },
      })
    } catch (err) {
      throw 'The pairing cannot be verified: ' + err
    }
  }

  /**
   * Confirm a pairing.
   * This method is called internally as the first successful push authentication is performed.
   * @param pairing
   * @returns
   */
  private async pairingConfirm(
    pairing: SerializedPairing
  ): Promise<SerializedPairing> {
    try {
      // API: confirm pairing
      const data: APIDeviceUpdateRequest = {
        action: 'pair_confirm',
        pairing: {
          appId: this.options.app.id,
          userId: pairing.userID,
        },
      }
      const apiResponse: APIDeviceUpdateResponse = await axios.put(
        `${this.NOVAUTH_API_URL}/devices/${pairing.device.id}`,
        data
      )

      if (apiResponse.status !== 200)
        throw 'error from the NovAuth API: ' + apiResponse.message

      // return the pairing data
      const { status, ...pairingMerge } = pairing
      return {
        status: 'confirmed',
        ...pairingMerge,
      }
    } catch (err) {
      throw 'The pairing cannot be confirmed: ' + err
    }
  }

  /**
   * Request Push Authentication
   * @param deviceData
   */
  public async pushAuthenticationIntent(
    pairing: SerializedPairing
  ): Promise<PushAuthenticationIntent> {
    try {
      /**
       * first check if the request can be performed
       * a push authentication can be requested only if
       * - a pairing has been confirmed: the device can be used as an authentication factor
       * - a pairing has been verified: the device needs to be confirmed by performing the first successful authentication
       *  */
      if (pairing.status !== 'confirmed' && pairing.status !== 'verified')
        throw 'The pairing was not confirmed or the confirm process already started.'

      const authenticationOptions = await this.f2l.assertionOptions()
      authenticationOptions.allowCredentials = [
        {
          id: base64decode(pairing.credential.id),
          type: 'public-key',
        },
      ]

      // API: push notification request
      // provide assertion and deviceID
      const data: APIPushAuthenticationRequest = {
        payload: {
          app: {
            name: this.options.app.name,
            origin: this.options.app.origin,
            webhook: this.options.app.webhook,
          },
          assertionRequest: authenticationOptions,
        },
      }
      const apiResponse: APIDeviceUpdateResponse = await axios.put(
        `${this.NOVAUTH_API_URL}/devices/${pairing.device.id}`,
        data
      )

      if (apiResponse.status !== 200)
        throw 'error from the NovAuth API: ' + apiResponse.message

      // if this is the first time a push authentication is requested for the user, edit the pairing status
      const { status, ...pairingMerge } = pairing
      const returnPairing: SerializedPairing =
        status === 'verified'
          ? { status: 'confirm_pending', ...pairingMerge }
          : pairing

      // return the operation data to be persistently stored and be later referenced when the authenticator
      // sends a response
      return {
        operation: PushAuthenticationOperation(
          base64encode(authenticationOptions.challenge),
          returnPairing
        ),
      }
    } catch (err) {
      throw 'The authentication request cannot be processed: ' + err
    }
  }

  /**
   * Verify a Push Authentication Response
   * @param deviceData
   * @param response
   */
  public async pushAuthenticationVerify(
    operation: PushAuthenticationOperation,
    response: PushAuthenticationResponse
  ): Promise<SerializedPairing> {
    try {
      const authnResult = await this.f2l.assertionResult(response.credential, {
        rpId: this.options.app.origin,
        challenge: operation.data.challenge,
        origin: this.options.app.origin,
        factor: 'either',
        prevCounter: operation.data.pairing.credential.counter,
        publicKey: operation.data.pairing.credential.publicKey,
        userHandle: operation.data.pairing.userID,
      })
      const authnrData = authnResult.authnrData

      // if this is the first successful push authentication, confirm the pairing
      const { credential, ...pairingMerge } =
        operation.data.pairing.status === 'confirm_pending'
          ? await this.pairingConfirm(operation.data.pairing)
          : operation.data.pairing

      // return the update pairing data, to be persistently stored for future access
      return {
        credential: {
          id: operation.data.pairing.credential.id,
          counter: authnrData.get('signCount'),
          publicKey: operation.data.pairing.credential.publicKey,
        },
        ...pairingMerge,
      }
    } catch (err) {
      throw 'The authentication request cannot be verified: ' + err
    }
  }
}

export default NovAuthSDK
