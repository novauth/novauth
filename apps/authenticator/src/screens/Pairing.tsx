import { decompress } from '@novauth/common'
import { StackScreenProps } from '@react-navigation/stack'
import { Button, Text } from '@rneui/base'
import { StyleSheet, View } from 'react-native'
import { RootStackNavigatorParamList } from '../navigation/RootStackNavigator'

type PairingProps = StackScreenProps<RootStackNavigatorParamList, 'Pairing'>
function Pairing({ navigation, route }: PairingProps) {
  const request = decompress(route.params.request)
  return (
    <View style={styles.container}>
      <Text h4>
        Are you sure to pair your device with this service?
      </Text>
      <Text>
        Name: {request.attestationRequest.rp.name}
      </Text>
      <Text>
        URL: {request.origin}
      </Text>

      <Text>
        Username: {request.attestationRequest.user.displayName}
      </Text>
      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button>Pair</Button>
        </View>
        <View style={styles.button}>
          <Button onPress={()=>navigation.navigate('Home')}>Cancel</Button>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 5,
    flexGrow: 1,
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingVertical: 10,
    bottom: 0,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
})

export default Pairing
