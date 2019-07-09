import Keygrip from 'keygrip'
import { randomBytes } from 'crypto'
import Koa, { Middleware, ParameterizedContext } from 'koa'
import { KoaConext, rand } from '../context'
import fjs from "fast-json-stringify"

/** Session
 * [session_id] => Session
 * session_id is being sent to the client in an encrypted cookie!
 */

export interface Session extends HashMap<any> {
  maxAge: number
  jwt: string
}

export const makeSession = (maxAge: number, jwt: string): Session => ({
  maxAge,
  jwt,
})

export class SessionStorage {
  private store = new Map<string, Session>()
  private timers = new Map<string, NodeJS.Timeout>()
  static key = 'sid'

  constructor(app: Koa<any, KoaConext>) {
    app.keys = new Keygrip(new Array(5).fill(0).map(rand), 'sha256', 'hex')
    this.destroy = this.destroy.bind(this)
  }

  get_id(length: number) {
    return randomBytes(length).toString('hex')
  }

  set(sid: string, session: Session) {
    if (this.timers.has(sid) && this.store.has(sid)) {
      const t = this.timers.get(sid)
      t && clearTimeout(t)
    }

    this.store.set(sid, session)
    this.timers.set(sid, global.setTimeout(this.destroy, session.maxAge, sid))

    return sid
  }

  get(session_id: string) {
    return this.store.get(session_id)
  }

  has(sid: string) {
    return this.store.has(sid)
  }

  destroy(sid: string) {
    this.store.delete(sid)
    this.timers.delete(sid)
  }

  set_key(sid: string, ctx: ParameterizedContext<any, KoaConext>) {
    ctx.cookies.set(SessionStorage.key, sid, {
      sameSite: true,
      httpOnly: true,
      signed: true,
      expires: new Date(
        new Date().valueOf() + (this.store.get(sid) as Session).maxAge
      ),
    })
  }
}
