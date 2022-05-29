/* eslint-disable jsx-a11y/accessible-emoji */
import { NavigationContainer } from '@react-navigation/native'
import { useEffect } from 'react'
import DataContextProvider from './contexts/DataContext'
import DeviceContextProvider from './contexts/DeviceContext'
import RootStackNavigator from './navigation/RootStackNavigator'
import Home from './screens/Home'
import Pairing from './screens/Pairing'
import QRScan from './screens/QRScan'
import Api from './utils/Api'



const App = () => {
  useEffect(() => {
    ;(async () => {
      await Api.init()
    })()
  })

  return (
    <DeviceContextProvider>
      <DataContextProvider>
        <NavigationContainer>
          <RootStackNavigator.Navigator>
            <RootStackNavigator.Screen name='Home' component={Home} />
            <RootStackNavigator.Screen name='QRScan' component={QRScan} />
            <RootStackNavigator.Screen name='Pairing' component={Pairing} />
          </RootStackNavigator.Navigator>
        </NavigationContainer>
      </DataContextProvider>
    </DeviceContextProvider>
  )
}

export default App
