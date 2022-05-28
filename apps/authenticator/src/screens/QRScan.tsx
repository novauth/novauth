import { StackScreenProps } from '@react-navigation/stack'
import { StyleSheet, Text, View } from 'react-native'
import { RootStackNavigatorParamList } from '../navigation/RootStackNavigator'
import { Button } from '@rneui/base'
import { useEffect, useState } from 'react'
import { BarCodeScanner } from 'expo-barcode-scanner'

type QRScanProps = StackScreenProps<RootStackNavigatorParamList, 'QRScan'>
function QRScan({ navigation }: QRScanProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanned, setScanned] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === 'granted')
    })()
  }, [])

  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: any
    data: string
  }) => {
    setScanned(true)
    navigation.navigate('Pairing', { request: JSON.parse(data) })
  }

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 5,
    flexGrow: 1,
  },
})

export default QRScan
