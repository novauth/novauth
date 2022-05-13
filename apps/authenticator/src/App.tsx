/* eslint-disable jsx-a11y/accessible-emoji */
import { NavigationContainer } from '@react-navigation/native'
import RootStackNavigator from './navigation/RootStackNavigator'
import Home from './screens/Home'


const App = () => {
  return (
    <NavigationContainer>
      <RootStackNavigator.Navigator>
        <RootStackNavigator.Screen name='Home' component={Home} />
      </RootStackNavigator.Navigator>
    </NavigationContainer>
  )
}

export default App
