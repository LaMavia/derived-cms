import { readFileSync } from 'fs'
import { resolve } from 'path'
import { rand } from '../context'
import fs from 'fs-extra'
import bcrypt from 'bcrypt'
import * as str from "../helpers/jmyson"
/**
 * {User} Schema translated by UsersManager::translate_from_json
 */
export interface User {
  _id: string
  username: string
  password: string
  email: string
  active: boolean
}

export class UsersManager {
  private users: HashMap<User> = {}
  private filePath = resolve(process.env['DC_DATA_PATH'] || '.', 'users.json')

  constructor() {
    const data = readFileSync(this.filePath, {
      encoding: 'utf-8',
    })
    this.users = this.translate_from_json(JSON.parse(data || '{}'))
  }

  private translate_from_json(json: HashMap): HashMap<User> {
    const translate = (k: string, v?: string): any => {
      switch (k) {
        case '_id':
          return String(v)
        case 'active':
          return !!v
        case 'email':
          return String(v)
        case 'password':
          return String(v)
        case 'username':
          return String(v)
        default: {
          console.log(`OmiTting users::data field "${k}"`)
          return
        }
      }
    }

    const m = new Map(Object.entries(json))
    const uniques: HashMap<User> = {}
    for (const k of m.keys()) {
      const u = (m.get(k) as any) as User
      const o = {} as User & HashMap
      for (const key in u) {
        const tv = translate(key, u[key as keyof User] as string)
        typeof tv !== 'undefined' && (o[key as any] = tv)
      }

      uniques[k] = o
    }

    return uniques
  }

  register_user({
    username,
    email,
    password,
  }: Omit<Omit<User, '_id'>, 'active'>): Promise<User> {
    return new Promise<User>((res, rej) => {
      // -------- Check if is taken -------- //
      if (
        Object.values(this.users).some(
          u => u.username === username || u.email == email
        )
      )
        rej(new Error('User is already taken'))

      // -------- Create a new user -------- //
      const id = new Array(10).fill(0).reduce(a => (a += rand()), '')

      bcrypt
        .hash(password, 4)
        .then(pass => {
          const u: User = {
            _id: id,
            username,
            email,
            active: true,
            password: pass,
          }
          this.users[id] = u

          res(u)
          this.saveData()
        })
        .catch(rej)
    })
  }

  login({
    username,
    password,
  }: Pick<User, 'username'> & Pick<User, 'password'>): Promise<User> {
    return new Promise((res, rej) => {
      // -------- Find user -------- //
      const user = Object.values(this.users).find(x => x.username === username)
      if (!user) return rej(new Error(`User "${username}" not found`))

      // -------- Compare passwords -------- //
      bcrypt
        .compare(password, user.password)
        .then(v => {
          if (v) res(user)
          else rej(`Wrong password`)
        })
        .catch(rej)
    })
  }

  saveData(): Promise<void> {
    return new Promise((res, rej) => {
      const data = JSON.stringify(this.users, null, 2)
      fs.writeFile(this.filePath, data, { encoding: 'utf-8' })
        .then(res)
        .catch(rej)
    })
  }
}
