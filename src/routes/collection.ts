import Router from 'koa-router'
import { KoaConext, secret } from '../context'
import * as str from '../helpers/jmyson'

const r = new Router<any, KoaConext>({
  prefix: '/collection',
})
r.get('/:model/overview', async ctx => {
  const model: string | undefined = ctx.params['model']

  if (!model) {
    const res: APIResponse = {
      data: undefined,
      error: `/collection/:model/overview | param "model" not specified`,
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

r.get('/:model/schema', async ctx => {
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
