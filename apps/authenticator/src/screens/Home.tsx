import { StackScreenProps } from '@react-navigation/stack'
import { StyleSheet, View } from 'react-native'
import { RootStackNavigatorParamList } from '../navigation/RootStackNavigator'
import { FAB, Text } from '@rneui/base'
import { useDataContext } from '../contexts/DataContext'

type HomeProps = StackScreenProps<RootStackNavigatorParamList, 'Home'>

function Home({ navigation }: HomeProps) {
  const { loading, pairings } = useDataContext()
  const pairingsArray = Object.values(pairings)
  return (
    <View style={styles.container}>
      {pairingsArray.length===0 &&  <Text>No accounts paired with this device.</Text>}
      <FAB
        visible={true}
        onPress={() => navigation.navigate('QRScan')}
        icon={{ name: 'add', color: 'white' }}
        color='blue'
        placement='right'
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 5,
    flexGrow: 1,
  },
})

export default Home
