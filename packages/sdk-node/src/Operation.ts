import { v4 } from 'uuid'

type OperationID = string

interface Operation<T> {
  id: string
  data: T
}

function generateOperationID(): string {
  return v4()
}

function Operation<T>(data: T): Operation<T> {
  return {
    id: generateOperationID(),
    data,
  }
}

export default Operation
export { OperationID }
