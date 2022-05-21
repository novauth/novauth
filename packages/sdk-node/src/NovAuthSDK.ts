// TODO: full module documentation
import { Fido2Lib } from 'fido2-lib'
import QRCode from 'qrcode'
import Base64Url from 'base64url'
import PairingIntent from './pairing/PairingIntent'
import PairingRequest from './pairing/PairingRequest'
import PairingResponse from './pairing/PairingResponse'
import PushAuthenticationResponse from './push-authentication/PushAuthenticationResponse'
import PushAuthenticationIntent from './push-authentication/PushAuthenticationIntent'
import PairingOperation from './pairing/PairingOperation'
import PushAuthenticationOperation from './push-authentication/PushAuthenticationOperation'
import Pairing from './Pairing'
import User from './User'

interface NovAuthSDKOptions {
  server: {
    origin: string
    webhook: string
    name: string
    iconUrl?: string
  }
  authenticator: 'device' | 'external' | 'any'
}

class NovAuthSDK {
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
      rpId: options.server.origin,
      rpName: options.server.name,
      rpIcon: options.server.iconUrl,
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
        Base64Url.toBase64(Buffer.from(registrationOptions.challenge))
      )
      return {
        operation,
        qrCode: await QRCode.toDataURL(
          JSON.stringify(
            PairingRequest.compress({
              operationId: operation.id,
              version: this.VERSION,
              notificationProvider: this.NOTIFICATION_PROVIDER,
              origin: this.options.server.origin,
              webhook: this.options.server.webhook,
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
    response: PairingResponse
  ): Promise<Pairing> {
    try {
      // verify pairing
      const regResult = await this.f2l.attestationResult(response.credential, {
        rpId: this.options.server.origin,
        challenge: operation.data.challenge,
        origin: this.options.server.origin,
        factor: 'either',
      }) // will throw on error

      const authnrData = regResult.authnrData
      // API: confirm pairing
      // TODO: implement the API

      // return the pairing data
      return {
        userID: operation.data.userId,
        device: {
          id: response.id,
        },
        credential: {
          id: Base64Url.encode(authnrData.get('credId')),
          counter: authnrData.get('signCount'),
          publicKey: authnrData.get('credentialPublicKeyPem'),
        },
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
    pairing: Pairing
  ): Promise<PushAuthenticationIntent> {
    try {
      const authenticationOptions = await this.f2l.assertionOptions()
      authenticationOptions.allowCredentials = [
        {
          id: Base64Url.toBuffer(pairing.credential.id),
          type: 'public-key',
        },
      ]

      // API: push notification request
      // provide assertion and deviceID
      // TODO:

      // return the operation data to be persistently stored and be later referenced when the authenticator
      // sends a response
      return {
        operation: PushAuthenticationOperation(
          Base64Url.toBase64(Buffer.from(authenticationOptions.challenge)),
          pairing
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
  ): Promise<Pairing> {
    try {
      const authnResult = await this.f2l.assertionResult(response.credential, {
        rpId: this.options.server.origin,
        challenge: operation.data.challenge,
        origin: this.options.server.origin,
        factor: 'either',
        prevCounter: operation.data.pairing.credential.counter,
        publicKey: operation.data.pairing.credential.publicKey,
        userHandle: operation.data.pairing.userID,
      })
      const authnrData = authnResult.authnrData
      // return the update pairing data, to be persistently stored for future access
      return {
        credential: {
          id: operation.data.pairing.credential.id,
          counter: authnrData.get('signCount'),
          publicKey: operation.data.pairing.credential.publicKey,
        },
        ...operation.data.pairing,
      }
    } catch (err) {
      throw 'The authentication request cannot be verified: ' + err
    }
  }
}

export default NovAuthSDK
