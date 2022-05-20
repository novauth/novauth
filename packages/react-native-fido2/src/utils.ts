import base64 from 'base-64'
import { Platform } from 'react-native'

function checkPlatform() {
  if (Platform.OS === 'ios')
    throw `@novauth/react-native-fido2 does not support iOS yet. If you want this feature to be implemented, please open a ticket on the project's GitHub repo https://github.com/novauth/novauth.`
}

function bufferDecode(b: ArrayBuffer): string {
  const arr = new Uint8Array(b)
  let res = ''
  let it = arr.values()
  let cur = it.next()
  while (!cur.done) {
    res += String.fromCharCode(cur.value)
    cur = it.next()
  }
  return res
}

function bufferEncode(s: string): ArrayBuffer {
  const arr: number[] = []
  for (let i = 0; i < s.length; i++) arr.push(s.charCodeAt(i))
  return new Uint8Array(arr)
}

function base64Encode(b: BufferSource): string {
  return base64.encode(bufferDecode(b as ArrayBuffer))
}

function base64Decode(s: string): ArrayBuffer {
  return bufferEncode(base64.decode(s))
}

export {
  base64Decode,
  base64Encode,
  bufferDecode,
  bufferEncode,
  checkPlatform,
}
