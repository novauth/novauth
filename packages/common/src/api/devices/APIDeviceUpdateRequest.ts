import { Pairing } from '../../pairing/index.js'

interface APIDeviceUpdateRequest {
  action: 'pair_verify' | 'pair_confirm' | 'pair'
  pairing: Omit<Pairing, 'status'>
}

export default APIDeviceUpdateRequest
