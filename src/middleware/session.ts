import { Middleware } from 'koa'
import { KoaConext } from '../context'
import jwt from 'jsonwebtoken'
import { Session, SessionStorage } from '../components/sessionStorage'

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
) => Middleware<any, KoaConext> = (allowedUrls: RegExp[] = []) => async (
  ctx,
  next
) => {
  const sid = ctx.cookies.get(key, {
    signed: true,
  })

  // -------- Sesion doesn't exist -------- //
  if (sid) {
    ctx.session = ctx.sessionsManager.get(sid)

    if (!ctx.session) {
      // Clean the cookie
      // @ts-ignore
      ctx.cookies.set(key, null)
      ctx.status = 302
      return ctx.redirect(redirect)
    } else {
      const old = Object.assign({}, ctx.session)
      await next()
      if (!compareSessions(old, ctx.session)) {
        const nsid = ctx.sessionsManager.set(sid, ctx.session)
        ctx.sessionsManager.set_key(nsid, ctx)
      }
    }
  } else if (allowedUrls.some(u => u.test(ctx.path))) {
    return next()
  } else {
    ctx.status = 302
    ctx.headers.follow = true
    return ctx.redirect(redirect)
  }
}
