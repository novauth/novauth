/* eslint-disable jsx-a11y/accessible-emoji */
import { NavigationContainer } from '@react-navigation/native'
import RootStackNavigator from './navigation/RootStackNavigator'
import Home from './screens/Home'
import Pairing from './screens/Pairing'
import QRScan from './screens/QRScan'



const App = () => {
  return (
    <NavigationContainer>
      <RootStackNavigator.Navigator>
      <RootStackNavigator.Screen name='Home' component={Home} />
      <RootStackNavigator.Screen name='QRScan' component={QRScan} />
      <RootStackNavigator.Screen name='Pairing' component={Pairing} />
      </RootStackNavigator.Navigator>
    </NavigationContainer>
  )
}

export default App
