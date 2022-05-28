import { createContext, useContext, useEffect, useState } from 'react'
import SecureStore from '../utils/SecureStore'

const DataContext = createContext<{
  pairings: { [k: string]: Pairing }
  loading: boolean
  addPairing?: (pairing: Pairing) => Promise<void>
  removePairing?: (pairing: Pairing) => Promise<void>
}>({
  pairings: {},
  loading: false,
})
const PAIRINGS_MASTER_ID = 'MASTER'

interface Pairing {
  app: {
    version: string
    id: string
    name: string
    origin: string
    webhook: string
  }
  user: {
    id: string
    name: string
  }
}

function pairingID(pairing: Pairing) {
  return `${pairing.app.id}#${pairing.user.id}`
}

function DataContextProvider({ children }: any) {
  const [pairings, setPairings] = useState<{ [k: string]: Pairing }>({})
  const [loading, setLoading] = useState<boolean>(true)

  async function addPairing(pairing: Pairing) {
    const newPairings = { ...pairings, [pairingID(pairing)]: pairing }
    setPairings(newPairings)
    await SecureStore.set(pairingID(pairing), JSON.stringify(pairing))
    await SecureStore.set(
      PAIRINGS_MASTER_ID,
      JSON.stringify(Object.keys(newPairings))
    )
  }

  async function removePairing(pairing: Pairing) {
    const { [pairingID(pairing)]: remove, ...rest } = pairings
    setPairings(rest)
    await SecureStore.remove(pairingID(pairing))
    await SecureStore.set(PAIRINGS_MASTER_ID, JSON.stringify(Object.keys(rest)))
  }

  useEffect(() => {
    ;(async () => {
      // get list of all pairings
      const pairingsIdsRaw = await SecureStore.get(PAIRINGS_MASTER_ID)
      if (pairingsIdsRaw != null) {
        const pairingsIds: string[] = JSON.parse(pairingsIdsRaw)

        // retrieve data for all pairings
        const pairings = (
          await Promise.all(
            pairingsIds.map(async (e) => await SecureStore.get(e))
          )
        )
          .filter((e) => e != null)
          .map((e) => JSON.parse(e as string) as Pairing)
        // convert to object for easier access
        let pairingsObject: { [k: string]: Pairing } = {}
        pairings.forEach((e) => {
          pairingsObject = { ...pairingsObject, [pairingID(e)]: e }
        })
        // set state
        setPairings(pairingsObject)
      }
      setLoading(false)
    })()
  }, [])
  return (
    <DataContext.Provider
      value={{ pairings, loading, addPairing, removePairing }}
    >
      {children}
    </DataContext.Provider>
  )
}

function useDataContext() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('Context must be used within a Provider')
  }
  return context
}

export default DataContextProvider
export { useDataContext }
