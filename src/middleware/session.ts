import { Middleware } from 'koa'
import { KoaConext } from '../context'
import {
  Session,
  SessionStorage,
  makeSession,
} from '../components/sessionStorage'
import * as str from '../helpers/jmyson'

export const sessionMiddleware: (
  allowedUrls: RegExp[] | undefined
) => Middleware<any, KoaConext> = () => {
  const isAuthRoute = /auth/
  return async (ctx, next) => {
    if (ctx.body) return
    const sid = ctx.cookies.get(SessionStorage.key)

    if (sid && ctx.sessionsManager.has(sid)) {
      ctx.session = ctx.sessionsManager.get(sid)
      if (isAuthRoute.test(ctx.path)) {
        ctx.status = 302
        ctx.redirect('back')
      } else {
        const old = str.session(ctx.session as Session)
        await next()
        if (!ctx.session || old !== str.session(ctx.session)) {
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
