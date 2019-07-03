import { DbInterface } from '../class/DbInterface'
import mongo from 'mongoose'

export class MongoDatabase extends DbInterface {
  private connection?: mongo.Connection
  private uri: string

  constructor() {
    super()
    this.uri = process.env['DC_DATABASE_URL'] || ''

    if (!this.uri) throw new Error('DC_DATABASE_URL missing from .env')
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
