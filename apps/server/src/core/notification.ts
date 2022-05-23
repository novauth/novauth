import { Expo } from 'expo-server-sdk'
import logger from './logger.js'

// Create a new Expo SDK client
// optionally providing an access token if you have enabled push security
let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN })

async function push(token: string, title: string, body: string, payload: any) {
  // Create the messages that you want to send to clients
  let messages = []
  // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

  // Check that all your push tokens appear to be valid Expo push tokens
  if (!Expo.isExpoPushToken(token))
    throw `Push token ${token} is not a valid Expo push token`

  // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
  messages.push({
    to: token,
    title,
    body,
    data: payload,
  })

  // The Expo push notification service accepts batches of notifications so
  // that you don't need to send 1000 requests to send 1000 notifications. We
  // recommend you batch your notifications to reduce the number of requests
  // and to compress them (notifications with similar content will get
  // compressed).
  let chunks = expo.chunkPushNotifications(messages)
  let tickets = []
  // Send the chunks to the Expo push notification service. There are
  // different strategies you could use. A simple one is to send one chunk at a
  // time, which nicely spreads the load out over time:
  for (let chunk of chunks) {
    let ticketChunk = await expo.sendPushNotificationsAsync(chunk)
    logger.info(ticketChunk)
    tickets.push(...ticketChunk)
    // NOTE: If a ticket contains an error code in ticket.details.error, you
    // must handle it appropriately. The error codes are listed in the Expo
    // documentation:
    // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
  }
}

export default { push }
