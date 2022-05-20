import { AttestationResult } from "fido2-lib"
import { DeviceID } from "../NovAuthSDK"

interface PairingResponse {
    id: DeviceID
    credential: AttestationResult
}

export default PairingResponse