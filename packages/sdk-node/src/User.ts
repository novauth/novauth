/**
 * The user type, part of the request sent to the authenticator.
 */
interface User {
  id: string
  name: string
  displayName: string
}

export default User
