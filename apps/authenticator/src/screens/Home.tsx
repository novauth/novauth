import { StackScreenProps } from '@react-navigation/stack'
import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { RootStackNavigatorParamList } from '../navigation/RootStackNavigator'

type HomeProps = StackScreenProps<RootStackNavigatorParamList, 'Home'>

function Home({}: HomeProps) {
  return (
    <SafeAreaView>
      <Text>NovAuth: Securing the Modern Web</Text>
    </SafeAreaView>
  )
}

export default Home
