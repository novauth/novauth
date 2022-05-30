import base64url from 'base64url'
import { Buffer } from 'buffer'

function base64encode(b: Buffer): string {
  return base64url.encode(b)
}
function base64decode(s: string): Buffer {
  return base64url.toBuffer(s)
}

export { base64decode, base64encode }
