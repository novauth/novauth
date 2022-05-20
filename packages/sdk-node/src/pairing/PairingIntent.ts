type PairingIntentID = string

interface PairingIntent {
    id: PairingIntentID
    qrCode: string,
}

export {PairingIntent, PairingIntentID}