import { DbInterface } from '../class/DbInterface'
import mongo from 'mongoose'
import fs from 'fs-extra'
import { resolve } from 'path'

export class MongoDatabase extends DbInterface {
  private connection?: mongo.Connection
  private uri: string
  private mongo_models: HashMap<mongo.Model<any>> = {}

  constructor(models: HashMap<Model>) {
    super(models)
    
    this.uri = process.env['DC_DATABASE_URL'] || ''

    if (!this.uri) throw new Error('DC_DATABASE_URL missing from .env')
    // -------- Initialize Models -------- //
    for (const mod of Object.values(models)) this.initModel(mod)
  }

  private translate_field_to_mongo(v: FieldType) {
    switch (v) {
      case 'String':
        return String
      case 'Boolean':
        return Boolean
      case 'Date':
        return Date
      case 'ID':
        return mongo.Schema.Types.ObjectId
      case 'Number':
        return Number
      case 'Text':
        return String
    }
  }

  private translate_mongo_to_field(v: Function) {
    switch (v.name) {
      case 'Boolean':
        return 'Boolean'
      case 'Date':
        return 'Date'
      case 'ObjectId':
        return 'ID'
      case 'Number':
        return 'Number'
      default:
        return 'String'
    }
  }

  private initModel(model: Model) {
    const { collection, schema } = model
    const proto_schema: HashMap<any> = {}
    for (const k in schema) {
      proto_schema[k] = this.translate_field_to_mongo(schema[k])
    }

    const sch = new mongo.Schema(proto_schema)

    const mod = mongo.model(collection, sch, collection)

    this.mongo_models[collection] = mod
  }

  connect() {
    return new Promise<void>((res, rej) => {
      mongo
        .connect(this.uri)
        .then(_ => {
          this.connection = mongo.connection
        })
        .then(res)
        .catch(rej)
    })
  }

  find(collection: string, filters: HashMap) {
    return new Promise((res, rej) => {
      if (!this.connection)
        return rej(
          "Database connection wasn't established; consider calling .connect()"
        )

      this.connection
        .collection(collection)
        .find(filters)
        .toArray()

        .then(res)
        .catch(rej)
    })
  }

  find_one(collection: string, filters: HashMap) {
    return new Promise((res, rej) => {
      if (!this.connection)
        return rej(
          "Database connection wasn't established; consider calling .connect()"
        )

      this.connection
        .collection(collection)
        .findOne(filters)

        .then(res)
        .catch(rej)
    })
  }

  update(collection: string, filters: HashMap, values: HashMap) {
    return new Promise((res, rej) => {
      if (!this.connection)
        return rej(
          "Database connection wasn't established; consider calling .connect()"
        )

      this.connection
        .collection(collection)
        .updateMany(filters, values)

        .then(res)
        .catch(rej)
    })
  }

  update_one(collection: string, filters: HashMap, values: HashMap) {
    return new Promise((res, rej) => {
      if (!this.connection)
        return rej(
          "Database connection wasn't established; consider calling .connect()"
        )

      this.connection
        .collection(collection)
        .updateOne(filters, values)

        .then(res)
        .catch(rej)
    })
  }

  delete(collection: string, filters: HashMap) {
    return new Promise((res, rej) => {
      if (!this.connection)
        return rej(
          "Database connection wasn't established; consider calling .connect()"
        )

      this.connection
        .collection(collection)
        .deleteMany(filters)

        .then(res)
        .catch(rej)
    })
  }

  delete_one(collection: string, filters: HashMap) {
    return new Promise((res, rej) => {
      if (!this.connection)
        return rej(
          "Database connection wasn't established; consider calling .connect()"
        )

      this.connection
        .collection(collection)
        .deleteOne(filters)

        .then(res)
        .catch(rej)
    })
  }

  insert(collection: string, values: HashMap) {
    return new Promise((res, rej) => {
      if (!this.connection)
        return rej(
          "Database connection wasn't established; consider calling .connect()"
        )

      this.connection
        .collection(collection)
        .insert(values, {
          forceServerObjectId: true,
        })

        .then(res)
        .catch(rej)
    })
  }

  collection_new(name: string, schema: HashMap<FieldType>) {
    return new Promise((res, rej) => {
      if (!this.connection)
        return rej(
          "Database connection wasn't established; consider calling .connect()"
        )

      this.connection
        .createCollection(name)
        .then(_ => {
          this.initModel({
            collection: name,
            schema,
          })
          res()
        })
        .catch(rej)
    })
  }

  collection_delete(name: string) {
    return new Promise((res, rej) => {
      if (!this.connection)
        return rej(
          "Database connection wasn't established; consider calling .connect()"
        )

      this.connection
        .dropCollection(name)
        .then(_ => ({
          dropCount: 1,
          collction: name,
        }))
        .then(res)
        .catch(rej)
    })
  }

  collection_cleanse(name: string) {
    return new Promise((res, rej) => {
      if (!this.connection)
        return rej(
          "Database connection wasn't established; consider calling .connect()"
        )

      this.connection
        .collection(name)
        .deleteMany({})

        .then(res)
        .catch(rej)
    })
  }

  field_new<T = any>(
    collection: string,
    key: string,
    type: FieldType,
    defaultValue: T
  ) {
    return new Promise((res, rej) => {
      if (!this.connection)
        return rej(
          "Database connection wasn't established; consider calling .connect()"
        )

      this.connection
        .collection(collection)
        .updateMany(
          {
            [key]: {
              $exists: false,
            },
          },
          {
            $set: {
              [key]: defaultValue,
            },
          }
        )
        .then(r => {
          this.mongo_models[collection].schema.add({
            [key]: this.translate_field_to_mongo(type),
          })
          res(JSON.stringify(r))
        })
        .catch(rej)
    })
  }

  field_rename(collection: string, key: string, newKey: string) {
    return new Promise((res, rej) => {
      if (!this.connection)
        return rej(
          "Database connection wasn't established; consider calling .connect()"
        )

      this.connection
        .collection(collection)
        .updateMany(
          {},
          {
            $rename: {
              [key]: newKey,
            },
          }
        )

        .then(res)
        .catch(rej)
    })
  }

  field_delete(collection: string, key: string) {
    return new Promise((res, rej) => {
      if (!this.connection)
        return rej(
          "Database connection wasn't established; consider calling .connect()"
        )

      this.connection
        .collection(collection)
        .updateMany(
          {},
          {
            $unset: { [key]: '' },
          }
        )

        .then(res)
        .catch(rej)
    })
  }

  save_schemas() {
    return new Promise<void>((res, rej) => {
      console.log('Saving schemas')
      for (const col in this.mongo_models) {
        const mm = this.mongo_models[col]
        const def = mm.schema.obj
        const toSave: Schema = {}

        // -------- Translate back to FieldTypes -------- //
        for (const k in def) {
          const v: Function = def[k]
          /**
           * @note Handle strings, because during translation to bson types, difference between "Text" and "String" is lost.
           */
          if (v.name === "String") {
            toSave[k] = this.models[col].schema[k] || 'String'
          } else {
            toSave[k] = this.translate_mongo_to_field(v)
          }
        }

        this.models[col].schema = toSave
      }

      // -------- Save -------- //
      const path = resolve(process.env['DC_DATA_PATH'] || '.', 'models.json')
      const data = JSON.stringify(this.models, null, 2)
      fs.writeFile(path, data)
        .then(r => {
          console.log(`saved models to ${path}`)
          console.log('Models: \n', data)
          return r
        })
        .then(res)
        .catch(rej)
    })
  }
}
