import { Fido2Lib } from 'fido2-lib'
import QRCode from 'qrcode'
import Base64Url from 'base64url'
import { PairingIntent, PairingIntentID } from './pairing/PairingIntent'
import PairingRequest from './pairing/PairingIntentData'
import PairingResponse from './pairing/PairingResponse'
import PushAuthenticationResponse from './push-authentication/PushAuthenticationResponse'

interface NovAuthSDKOptions {
  server: {
    origin: string
    webhook: string
    name: string
    iconUrl?: string
  }
  authenticator: 'device' | 'external' | 'any'
}

interface User {
  id: string
  name: string
  displayName: string
}

interface DeviceData {
  deviceID: DeviceID
  credential: {
    id: string
    counter: string
    publicKey: string
  }
}

type DeviceID = string

class NovAuthSDK {
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
    const registrationOptions = await this.f2l.attestationOptions()
    registrationOptions.user = {
      id: user.id,
      name: user.name,
      displayName: user.displayName,
    }

    return {
      id: Base64Url.toBase64(Buffer.from(registrationOptions.challenge)),
      qrCode: await QRCode.toDataURL(
        JSON.stringify(
          PairingRequest.compress({
            version: '0.0.0',
            notificationProvider: 'novauth',
            origin: this.options.server.origin,
            webhook: this.options.server.webhook,
            attestationRequest: registrationOptions,
          })
        )
      ),
    }
  }

  public async pairingVerify(
    id: PairingIntentID,
    response: PairingResponse
  ): Promise<DeviceData> {
    try {
      // verify pairing
      const regResult = await this.f2l.attestationResult(response.credential, {
        challenge: id,
        origin: this.options.server.origin,
        factor: 'either',
      }) // will throw on error

      const authnrData = regResult.authnrData
      const credId = Base64Url.encode(authnrData.get('credId'))

      // confirm pairing by calling the NovAuth API
      // TODO: implement the API

      // return the pairing data
      return {
        deviceID: response.id,
        credential: {
          id: credId,
          counter: authnrData.get('counter'),
          publicKey: authnrData.get('credentialPublicKeyPem'),
        },
      }
    } catch (err) {
      throw 'The pairing cannot be confirmed: ' + err
    }
  }

  public pushAuthenticationRequest(deviceData: DeviceData) {
    // TODO:
  }

  public pushAuthenticationVerify(
    deviceData: DeviceData,
    response: PushAuthenticationResponse
  ) {
    // TODO:
  }
}

export default NovAuthSDK
export { DeviceID }
