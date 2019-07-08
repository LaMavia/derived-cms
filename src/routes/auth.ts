import Router from 'koa-router'
import { KoaConext } from '../context'
import jwt from 'jsonwebtoken'
import { makeSession, SessionStorage } from '../components/sessionStorage'

const r = new Router<any, KoaConext>({
  prefix: '/auth',
})

const defaultAge = 24 * 60 * 60 * 1000

r.use(async (ctx, next) => {
  const c = ctx.cookies.get(SessionStorage.key, {
    signed: true,
  })
  if (c) {
    ctx.status = 302
    return ctx.redirect(ctx.origin)
  } else {
    return await next()
  }
})

r.post('/signin', async ctx => {
  const { username, password } = ctx.request.body

  if (!(username && password)) {
    ctx.status = 401
    return
  }
  const user = await ctx.usersManager
    .login({ username, password })
    .catch(error => {
      ctx.body = JSON.stringify({
        error,
      })
    })

  if (!user) return

  const token = jwt.sign(
    {
      user,
    },
    ctx.secret
  )

  const s = makeSession(defaultAge, token)
  const sid = ctx.sessionsManager.set(ctx.sessionsManager.get_id(24), s)
  ctx.sessionsManager.set_key(sid, ctx)

  ctx.body = JSON.stringify({
    id: user._id,
  })
})

r.post('/signup', async ctx => {
  const { username, email, password, repeat_password } = ctx.request.body

  if (
    [username, email, password, repeat_password].some(
      field => !(typeof field === 'string' && field.length > 0)
    ) ||
    password !== repeat_password
  ) {
    ctx.status = 401
    return
  }

  const user = await ctx.usersManager
    .register_user({
      email,
      username,
      password,
    })
    .catch(error => {
      ctx.status = 500
      ctx.body = JSON.stringify({
        error,
      })
    })

  if (!user) {
    return
  }
  const token = jwt.sign(
    {
      user,
    },
    ctx.secret
  )

  ctx.status = 200
  const s = makeSession(defaultAge, token)
  const sid = ctx.sessionsManager.set(ctx.sessionsManager.get_id(24), s)
  ctx.sessionsManager.set_key(sid, ctx)

  ctx.body = JSON.stringify({
    id: user._id,
  })
})

export default r
