declare interface HashMap<T = string> {
  [key: string]: T
}

declare type Option<T> = T | undefined

type FieldType = 'String' | 'Text' | 'ID' | 'Date' | 'Boolean' | 'Number'
type Schema = HashMap<FieldType>
interface Model {
  collection: string
  schema: Schema
}

declare type Schemas = HashMap<Schema>
declare type Json = string

declare interface APIResponse<DataT = Array<HashMap<any>>> {
  data?: DataT
  error?: string
  ok: boolean
}