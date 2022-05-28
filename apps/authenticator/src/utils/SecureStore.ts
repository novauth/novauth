import * as SecureStore from 'expo-secure-store'

async function set(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value)
}

async function get(key: string): Promise<string | null> {
  return await SecureStore.getItemAsync(key)
}

async function remove(key: string): Promise<void> {
  return await SecureStore.deleteItemAsync(key)
}

export default { set, get, remove }