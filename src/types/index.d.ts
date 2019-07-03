declare interface HashMap<T = string> {
  [key: string]: T
}

type FieldType = 'String' | 'Text' | 'ID' | 'Date' | 'Boolean' | 'Number'
type Schema = HashMap<FieldType>
interface Model {
  collection: string
  schema: Schema
}

declare interface Profile {
  models: HashMap<Schema>
}
