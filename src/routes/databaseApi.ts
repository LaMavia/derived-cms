import Router from 'koa-router'
import { KoaConext } from '../context'

const r = new Router<any, KoaConext>({
  prefix: '/db_api/',
})
// -------- API Schema -------- //
/**
 1. "/all/:model" => returns every entry of the specified model
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

  for (const modelName of q ? q.split(',') : []) {
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
