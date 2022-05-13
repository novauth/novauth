import { createStackNavigator } from '@react-navigation/stack'

type RootStackNavigatorParamList = {
  Home: undefined
}

const RootStackNavigator = createStackNavigator<RootStackNavigatorParamList>()

export default RootStackNavigator
export { RootStackNavigatorParamList }
