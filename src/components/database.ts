import {
  DbInterface,
  CollectionStats,
  CollectionModel,
} from '../class/DbInterface'
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

  private getDefaultValue(type: FieldType) {
    switch (type) {
      case 'Boolean':
        return true
      case 'Date':
        new Date().toLocaleDateString('en-EN')
      case 'ID':
        return mongo.Types.ObjectId.generate().toString('hex')
      case 'Number':
        return 0
      case 'String':
        return ''
      case 'Text':
        return ''
      default:
        return null
    }
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
        .then(() => {
          delete this.models[name]
          delete this.mongo_models[name]
        })
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

  field_new(collection: string, key: string, type: FieldType) {
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
              [key]: this.getDefaultValue(type),
            },
          }
        )
        .then(r => {
          debugger
          this.models[collection].schema[key] = type
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
        .then(dbRes => {
          const model = this.models[collection].schema
          model[newKey] = model[key]
          delete model[key]

          res(dbRes)
        })
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

        .then(dbRes => {
          delete this.models[collection].schema[key]
          res(dbRes)
        })
        .catch(rej)
    })
  }

  stats(collection: string) {
    return new Promise<CollectionStats>((res, rej) => {
      if (!this.connection)
        return rej(
          "Database connection wasn't established; consider calling .connect()"
        )

      this.connection
        .collection(collection)
        .stats({
          scale: 1024,
        })
        .then(
          stats =>
            ({
              count: stats.count,
              size: [stats.size, 'kb'],
            } as CollectionStats)
        )
        .then(res)
        .catch(rej)
    })
  }

  collections_all_labels() {
    return new Promise<string[]>((res, rej) => {
      if (!this.connection)
        return rej(
          "Database connection wasn't established; consider calling .connect()"
        )

      res(Object.keys(this.models))
    })
  }

  collections_wschemas(collections?: string[]) {
    return new Promise<CollectionModel[]>((res, rej) => {
      if (!this.connection)
        return rej(
          "Database connection wasn't established; consider calling .connect()"
        )

      let ks = Object.keys(this.models)
      if (collections && collections.length)
        ks = ks.filter(k => collections.some(c => k === c))

      res(
        ks.reduce(
          (acc, k) => {
            const m = this.models[k]
            const schema = Object.entries(m.schema)
            acc.push({
              collection: m.collection,
              schema,
            })
            return acc
          },
          [] as CollectionModel[]
        )
      )
    })
  }

  save_schemas() {
    return new Promise<void>((res, rej) => {
      console.log('Saving schemas')
      console.time("models_saver")

      // -------- Save -------- //
      const path = resolve(process.env['DC_DATA_PATH'] || '.', 'models.json')
      const data = JSON.stringify(this.models, null, 2)
      fs.writeFile(path, data)
        .then(r => {
          console.log(`saved models to ${path}`)
          console.timeEnd("models_saver")
          console.log('Models: \n', data)
          return r
        })
        .then(res)
        .catch(rej)
    })
  }
}
