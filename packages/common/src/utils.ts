import base64url from 'base64url'
import { Buffer } from 'buffer'

function base64encode(b: ArrayBuffer): string {
  return base64url.encode(Buffer.from(b))
}
function base64decode(s: string): ArrayBuffer {
  return base64url.toBuffer(s).buffer
}

function base64decodestring(s: string): string {
  return base64url.decode(s)
}

function base64encodestring(s: string): string {
  return base64url.encode(s)
}

export { base64decode, base64encode, base64decodestring, base64encodestring }
