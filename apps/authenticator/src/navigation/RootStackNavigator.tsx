import { PairingRequestCompressed } from '@novauth/common'
import { createStackNavigator } from '@react-navigation/stack'

type RootStackNavigatorParamList = {
  Home: undefined
  QRScan: undefined
  Pairing: { request: PairingRequestCompressed }
}

const RootStackNavigator = createStackNavigator<RootStackNavigatorParamList>()

export default RootStackNavigator
export { RootStackNavigatorParamList }
