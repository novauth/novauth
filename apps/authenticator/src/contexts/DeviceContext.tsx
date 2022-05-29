import { DeviceID } from '@novauth/common'
import * as Device from 'expo-device'
import { Subscription } from 'expo-modules-core'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import SecureStore from '../utils/SecureStore'
import Api from '../utils/Api'

async function registerForPushNotificationsAsync() {
  let token
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!')
      return
    }
    token = (
      await Notifications.getExpoPushTokenAsync({
        experienceId: '@novauth/authenticator',
      })
    ).data
  } else {
    alert('Must use physical device for Push Notifications')
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    })
  }

  return token
}

const DeviceContext = createContext<{
  deviceId: DeviceID
  expoPushToken: string
}>({
  deviceId: '',
  expoPushToken: '',
})

const SECURESTORE_DEVICE_DATA_KEY = 'DEVICE'

function DeviceContextProvider({ children }: any) {
  const [expoPushToken, setExpoPushToken] = useState<string>('')
  const [deviceId, setDeviceId] = useState<string>('')
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null)
  const notificationListener = useRef<Subscription>()
  const responseListener = useRef<Subscription>()

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  })

  useEffect(() => {
    ;(async () => {
      // register for push notification
      const token = await registerForPushNotificationsAsync()
      setExpoPushToken(token === undefined ? '' : token)

      // This listener is fired whenever a notification is received while the app is foregrounded
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          //TODO: notification listener FOREGROUND
          setNotification(notification)
        })

      // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          //TODO: notification listener when user taps on the notification
          console.log(response)
        })

      console.log('load device id')
      // load NovAuth device ID
      let loadedDeviceId = await SecureStore.get(SECURESTORE_DEVICE_DATA_KEY)
      if (loadedDeviceId === null) {
        // register the device on NovAuth
        console.log('register on Novauth')
        loadedDeviceId = (await Api.registerDevice(token as string)).deviceId
        // store the received device id on SecureStore
        await SecureStore.set(SECURESTORE_DEVICE_DATA_KEY, loadedDeviceId)
      }
      // set the deviceId in the context
      setDeviceId(loadedDeviceId)

      console.log(loadedDeviceId)
      console.log(expoPushToken)
      return () => {
        if (notificationListener.current)
          Notifications.removeNotificationSubscription(
            notificationListener.current
          )
        if (responseListener.current)
          Notifications.removeNotificationSubscription(responseListener.current)
      }
    })()
  }, [])

  return (
    <DeviceContext.Provider value={{ deviceId, expoPushToken }}>
      {children}
    </DeviceContext.Provider>
  )
}

function useDeviceContext() {
  const context = useContext(DeviceContext)
  if (context === undefined) {
    throw new Error('Context must be used within a Provider')
  }
  return context
}

export default DeviceContextProvider
export { useDeviceContext }
