import PairingOperation from './PairingOperation'

interface PairingIntent {
  operation: PairingOperation
  qrCode: string
}

export default PairingIntent
