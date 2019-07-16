import Router from 'koa-router'
import { KoaConext, secret } from '../context'
import * as str from '../helpers/jmyson'

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
      data: undefined,
      error: `/all/:model | param "model" not specified`,
      ok: false,
    }

    ctx.body = str.api_error(res)
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

r.get('models', async ctx => {
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

  // Using fast-json-stringify wouldn't bring any perf. boost, because models' keys are dynamic (each model is different)
  ctx.body = JSON.stringify({
    data,
    ok: true,
    error: '',
  })
})

r.get('stats/:model', async ctx => {
  const model: string | undefined = ctx.params['model']

  if (!model) {
    const res: APIResponse = {
      data: undefined,
      error: `stats/:model | param "model" not specified`,
      ok: false,
    }

    ctx.body = str.api_error(res)
  } else {
    const stats = await ctx.db.stats(model).catch(err => err as Error)
    if (stats instanceof Error)
      ctx.body = str.api_error({
        data: undefined,
        error: stats.message,
        ok: false,
      })
    else {
      ctx.body = str.api_stats_res({
        data: stats,
        error: '',
        ok: true,
      })
    }
  }
})

r.get('labels', async ctx => {
  const data = await ctx.db
    .collections_all_labels()
    .catch(err => new Error(err))

  if (data instanceof Error)
    ctx.body = str.api_error({
      data: undefined,
      error: data.message,
      ok: false,
    })
  else ctx.body = str.api_str_arr(data)
})

r.get('collection/:model/overview', async ctx => {
  const model: string | undefined = ctx.params['model']

  if (!model) {
    const res: APIResponse = {
      data: undefined,
      error: `collection/:model/overview | param "model" not specified`,
      ok: false,
    }

    ctx.body = str.api_error(res)
  } else {
    const rs = await Promise.all([
      ctx.db.stats(model),
      ctx.db.collections_wschemas([model]),
    ]).catch(err => new Error(err))

    if (rs instanceof Error) {
      ctx.body = str.api_error({
        data: undefined,
        error: `${rs.message};\n${rs.stack}`,
        ok: false,
      })
    } else {
      const [stats, colmodel] = rs
      ctx.body = JSON.stringify({
        data: {
          stats,
          collection: colmodel[0].collection,
          schema: colmodel[0].schema,
        },
        error: '',
        ok: true,
      })
    }
  }
})

r.get('collection/:model/schema', async ctx => {
  const model: string | undefined = ctx.params['model']

  if (!model) {
    const res: APIResponse = {
      data: undefined,
      error: `collection/:model/overview | param "model" not specified`,
      ok: false,
    }

    ctx.body = str.api_error(res)
  } else {
    const schema = await ctx.db
      .collections_wschemas([model])
      .catch(err => new Error(err))

    if (schema instanceof Error) {
      ctx.body = str.api_error({
        data: undefined,
        error: `${schema.message};\n${schema.stack}`,
        ok: false,
      })
    } else {
      ctx.body = JSON.stringify({
        data: schema[0].schema,
        error: '',
        ok: true,
      })
    }
  }
})

export default r
