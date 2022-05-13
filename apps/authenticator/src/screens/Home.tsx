import { StackScreenProps } from '@react-navigation/stack'
import { StyleSheet, Text, View } from 'react-native'
import { RootStackNavigatorParamList } from '../navigation/RootStackNavigator'
import { FAB } from '@rneui/base'

type HomeProps = StackScreenProps<RootStackNavigatorParamList, 'Home'>

function Home({}: HomeProps) {
  return (
    <View style={styles.container}>
      <Text>NovAuth: Securing the Modern Web</Text>
      <FAB
        visible={true}
        onPress={() => {}}
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
