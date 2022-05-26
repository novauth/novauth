import PairingOperation from './PairingOperation.js'

interface PairingIntent {
  operation: PairingOperation
  qrCode: string
}

export default PairingIntent
