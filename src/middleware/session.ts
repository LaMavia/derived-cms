import { Middleware } from 'koa'
import { KoaConext } from '../context'
import {
  Session,
  SessionStorage,
  stringifySession,
  makeSession,
} from '../components/sessionStorage'

const key = SessionStorage.key
const redirect = '/auth/signin'

const compareSessions = (s1: Session, s2: Session): boolean => {
  const k1 = Object.keys(s1)
  const k2 = Object.keys(s2)

  if (k1.length !== k2.length) return false

  // Since session contains only primitoves, we can save some time here
  // => No recirsive checking needed
  for (const k in s1) if (s1[k] !== s2[k]) return false

  return true
}

export const sessionMiddleware: (
  allowedUrls: RegExp[] | undefined
) => Middleware<any, KoaConext> = () => {
  const isAuthRoute = /auth/
  return async (ctx, next) => {
    if (ctx.body) return
    const sid = ctx.cookies.get(key)

    if (sid && ctx.sessionsManager.has(sid)) {
      ctx.session = ctx.sessionsManager.get(sid)
      if (isAuthRoute.test(ctx.path)) {
        ctx.status = 302
        ctx.redirect('back')
      } else {
        const old = stringifySession(ctx.session as Session)
        await next()
        if (!ctx.session || old !== stringifySession(ctx.session)) {
          let newSession: Session
          if (
            ctx.session == null ||
            !(ctx.session || typeof ctx.session === undefined)
          )
            newSession = makeSession(24 * 60 * 60 * 1000, JSON.parse(old).jwt)
          else newSession = ctx.session

          const nsid = ctx.sessionsManager.set(sid, newSession)

          ctx.sessionsManager.set_key(nsid, ctx)
        }
      }
    } else if (!isAuthRoute.test(ctx.path)) {
      ctx.status = 302
      ctx.redirect('/auth/signin')
    } else next()
  }
}

/**
 * const sid =
      ctx.cookies.get(key, {
        signed: true,
      }) || ctx.cookies.get(key)

    // -------- Sesion doesn't exist -------- //
    if (sid) {
      ctx.session = ctx.sessionsManager.get(sid)

      // -------- session has expired, clean the cookie -------- //
      if (typeof ctx.session === 'undefined') {
        // @ts-ignore, because it doesn't allow "null", but it works
        // @ts-ignore
        ctx.cookies.set(key, null, {
          sameSite: true,
          httpOnly: true,
          signed: true,
        })
      }
      // -------- Prevent loggedin users from accessing the signin/up forms -------- //
      else if (/\/auth/.test(ctx.path)) {
        ctx.status = 302
        return ctx.redirect('/')
      }
      // -------- Mannage session -------- //
      else {
        const old = stringifySession(ctx.session) // Object.assign({}, ctx.session)
        await next()
        if (old !== stringifySession(ctx.session)) {
          const nsid = ctx.sessionsManager.set(sid, ctx.session)
          ctx.sessionsManager.set_key(nsid, ctx)
        }
      }
    }
    // -------- Redirect not loggedin users to the signin form -------- //
    else if (allowed.test(ctx.url)) {
      return next()
    } else {
      ctx.status = 302
      return ctx.redirect(redirect)
    }
    }
 */
