import { DbInterface } from '../class/DbInterface'
import mongo, { Types } from 'mongoose'

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
        return Types.ObjectId
      case 'Number':
        return Number
      case 'Text':
        return String
    }
  }

  private initModel(model: Model) {
    const { collection, schema } = model
    const proto_schema: HashMap<any> = {}
    for (const k in schema) {
      proto_schema[k] = this.translate_field_to_mongo(schema[k])
    }

    const sch = new mongo.Schema(proto_schema)
    const mod = new mongo.Model(sch) as mongo.Model<any>

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
    return new Promise<String>((res, rej) => {
      if (!this.connection)
        return rej(
          "Database connection wasn't established; consider calling .connect()"
        )

      this.connection
        .collection(collection)
        .find(filters)
        .toArray()
        .then(JSON.stringify)
        .then(res)
        .catch(rej)
    })
  }

  find_one(collection: string, filters: HashMap) {
    return new Promise<String>((res, rej) => {
      if (!this.connection)
        return rej(
          "Database connection wasn't established; consider calling .connect()"
        )

      this.connection
        .collection(collection)
        .findOne(filters)
        .then(JSON.stringify)
        .then(res)
        .catch(rej)
    })
  }

  update(collection: string, filters: HashMap, values: HashMap) {
    return new Promise<String>((res, rej) => {
      if (!this.connection)
        return rej(
          "Database connection wasn't established; consider calling .connect()"
        )

      this.connection
        .collection(collection)
        .updateMany(filters, values)
        .then(JSON.stringify)
        .then(res)
        .catch(rej)
    })
  }

  update_one(collection: string, filters: HashMap, values: HashMap) {
    return new Promise<String>((res, rej) => {
      if (!this.connection)
        return rej(
          "Database connection wasn't established; consider calling .connect()"
        )

      this.connection
        .collection(collection)
        .updateOne(filters, values)
        .then(JSON.stringify)
        .then(res)
        .catch(rej)
    })
  }

  delete(collection: string, filters: HashMap) {
    return new Promise<String>((res, rej) => {
      if (!this.connection)
        return rej(
          "Database connection wasn't established; consider calling .connect()"
        )

      this.connection
        .collection(collection)
        .deleteMany(filters)
        .then(JSON.stringify)
        .then(res)
        .catch(rej)
    })
  }

  delete_one(collection: string, filters: HashMap) {
    return new Promise<String>((res, rej) => {
      if (!this.connection)
        return rej(
          "Database connection wasn't established; consider calling .connect()"
        )

      this.connection
        .collection(collection)
        .deleteOne(filters)
        .then(JSON.stringify)
        .then(res)
        .catch(rej)
    })
  }

  insert(collection: string, values: HashMap) {
    return new Promise<String>((res, rej) => {
      if (!this.connection)
        return rej(
          "Database connection wasn't established; consider calling .connect()"
        )

      this.connection
        .collection(collection)
        .insert(values, {
          forceServerObjectId: true,
        })
        .then(JSON.stringify)
        .then(res)
        .catch(rej)
    })
  }
}
