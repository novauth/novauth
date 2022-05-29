import { Pairing } from '../../pairing'

interface APIDeviceUpdateRequest {
  action: 'pair_verify' | 'pair_confirm' | 'pair'
  pairing: Omit<Pairing, 'status'>
}

export default APIDeviceUpdateRequest
