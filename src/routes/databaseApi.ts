import Router from 'koa-router'
import { KoaConext, secret } from '../context'
import jwt from 'koa-jwt'
import jsonwebtoken from 'jsonwebtoken'

const r = new Router<any, KoaConext>({
  prefix: '/db_api/',
})

// -------- API Schema -------- //
/**
 1. "/all/:model" => returns every entry of the specified model
 2. "models" => returns all the schemas
*/
// -------- /API Schema -------- //
r.get('all/:model', async (ctx, _next) => {
  const model: string | undefined = ctx.params['model']

  if (!model) {
    const res: APIResponse = {
      data: '',
      error: `/all/:model | param "model" not specified`,
      ok: false,
    }

    ctx.body = JSON.stringify(res)
  } else {
    ctx.body = JSON.stringify(
      await ctx.db
        .find(model)
        .then(data => ({
          data,
          ok: true,
          error: '',
        }))
        .catch(error => {
          console.error(error)
          return {
            data: '',
            ok: false,
            error,
          }
        })
    )
  }
})

r.get('models', ctx => {
  const data = []

  const q = typeof ctx.query['models'] === 'string' ? ctx.query['models'] : ''
  const all = ctx.query['all']

  for (const modelName of all
    ? Object.keys(ctx.db.models)
    : q
    ? q.split(',')
    : []) {
    if (!modelName) continue
    data.push(ctx.db.models[modelName])
  }

  ctx.body = JSON.stringify({
    data,
    ok: true,
    error: '',
  })
})

export default r
