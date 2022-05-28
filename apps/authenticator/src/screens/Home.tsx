import { StackScreenProps } from '@react-navigation/stack'
import { StyleSheet, View } from 'react-native'
import { RootStackNavigatorParamList } from '../navigation/RootStackNavigator'
import { FAB } from '@rneui/base'

type HomeProps = StackScreenProps<RootStackNavigatorParamList, 'Home'>

function Home({ navigation }: HomeProps) {
  return (
    <View style={styles.container}>
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
