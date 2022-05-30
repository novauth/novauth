import base64url from 'base64url'
import { Buffer } from 'buffer'

function base64encode(b: ArrayBuffer): string {
  return base64url.encode(Buffer.from(b))
}
function base64decode(s: string): ArrayBuffer {
  return base64url.toBuffer(s).buffer
}

export { base64decode, base64encode }
