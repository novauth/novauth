import { Pairing } from '../../devices'

interface APIDeviceUpdateRequest {
  action: 'pair_verify' | 'pair_confirm'
  pairing: Omit<Pairing, 'status'>
}

export default APIDeviceUpdateRequest
