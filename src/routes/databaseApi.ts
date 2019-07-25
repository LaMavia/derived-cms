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

// -------- Fields API -------- //

r.post(':model/field/delete', async ctx => {
  const model: string = ctx.params['model']
  const key: Option<string> = ctx.query['key']

  if (!key) {
    const res: APIResponse = {
      data: undefined,
      error: `query param "key" not specified`,
      ok: false,
    }

    ctx.body = str.api_error(res)
  } else {
    const dbRes = await ctx.db
      .field_delete(model, key)
      .catch(err => new Error(err))
    if (dbRes instanceof Error) {
      ctx.body = str.api_error({
        data: undefined,
        error: `${dbRes.message};\n${dbRes.stack}`,
        ok: false,
      })
    } else
      ctx.body = JSON.stringify({
        data: dbRes,
        error: '',
        ok: true,
      })
  }
})

r.post(':model/field/add', async ctx => {
  const model: string = ctx.params['model']
  const key: Option<string> = ctx.query['key']
  const type: Option<FieldType> = ctx.query['type']

  if (!(key && type)) {
    const res: APIResponse = {
      data: undefined,
      error: `query param "key" or "type" not specified`,
      ok: false,
    }

    ctx.body = str.api_error(res)
  } else {
    const dbRes = await ctx.db
      .field_new(model, key, type)
      .catch((err: any) => new Error(err))
    if (dbRes instanceof Error) {
      ctx.body = str.api_error({
        data: undefined,
        error: `${dbRes.message};\n${dbRes.stack}`,
        ok: false,
      })
    } else
      ctx.body = JSON.stringify({
        data: dbRes,
        error: '',
        ok: true,
      })
  }
})

r.post(':model/field/rename', async ctx => {
  const model: string = ctx.params['model']
  const oldkey: Option<string> = ctx.query['oldk']
  const newkey: Option<FieldType> = ctx.query['newk']

  if (!(oldkey && newkey)) {
    const res: APIResponse = {
      data: undefined,
      error: `query param "oldkey" or "newkey" not specified`,
      ok: false,
    }

    ctx.body = str.api_error(res)
  } else {
    const dbRes = await ctx.db
      .field_rename(model, oldkey, newkey)
      .catch((err: any) => new Error(err))
    if (dbRes instanceof Error) {
      ctx.body = str.api_error({
        data: undefined,
        error: `${dbRes.message};\n${dbRes.stack}`,
        ok: false,
      })
    } else
      ctx.body = JSON.stringify({
        data: dbRes,
        error: '',
        ok: true,
      })
  }
})
export default r
