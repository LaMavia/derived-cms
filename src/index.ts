import Koa from 'koa'
import KoaRouter from 'koa-router'
import dotenv from 'dotenv'
import emoji from 'node-emoji'
import KoaStatic from 'koa-static'
import cors from '@koa/cors'
import KoaLogger from 'koa-logger'
import KoaBody from 'koa-body'
import fs from 'fs-extra'
import mount from 'koa-mount'
import helmet from 'koa-helmet'
// @ts-ignore
import op from 'overload-protection'
import {
  vName,
  symbol,
  vVal,
  err,
  section,
  method,
  path,
  text,
} from './components/logger'

// -------- Routes -------- //
import index from './routes/index'
import dbApi from './routes/databaseApi'
import authRouter from './routes/auth'

// -------- /Routes -------- //

import { resolve } from 'path'
import { DbInterface } from './class/DbInterface'
import { MongoDatabase } from './components/database'
import { KoaConext, KoaState, secret } from './context'
import { UsersManager } from './components/users'
import { sessionMiddleware } from './middleware/session'
import { SessionStorage } from './components/sessionStorage'
;(async () => {
  const app = new Koa<KoaState, KoaConext>()
  const router = new KoaRouter<KoaState, KoaConext>()

  // -------- Prepare the Environment -------- //
  dotenv.config({
    debug: true,
  })
  const isEnvVar = /^DC_/
  const port = +(process.env['DC_PORT'] || 8000)
  const staticDir = process.env['DC_STATIC_PATH'] || resolve('./client/build')
  const dataDir = process.env['DC_DATA_PATH'] || resolve('./data')

  // -------- Load the data -------- //

  const models: HashMap<Model> = await fs
    .readFile(resolve(dataDir, 'models.json'), 'utf-8')
    // Preventing JSON.parse error, when the app is being initialized for the first time
    .then(data => JSON.parse(data || '{}'))
    .catch(err => {
      console.error(err)
      return {}
    })

  // -------- Init Database -------- //
  const db: DbInterface = new MongoDatabase(models)
  await db.connect()

  // -------- Init "CRON" jobs -------- //
  // setInterval(() => {
  //   db.save_schemas()
  // }, 60000)

  // -------- Init Context -------- //
  app.context.db = db
  app.context.usersManager = new UsersManager()
  app.context.secret = secret
  app.context.sessionsManager = new SessionStorage(app)

  app
    // .use(helmet())
    .use(
      cors({
        origin: '*',
      })
    )
    .use(KoaLogger())
    .use(KoaBody())
    .use(mount('/static', KoaStatic(staticDir, {
      gzip: true
    })))
    .use(authRouter.middleware())
    .use(sessionMiddleware([/\/auth/]))
    .use(
      router
        .use(dbApi.routes())
        .use(index.routes())
        .middleware()
    )
    .use(router.allowedMethods())
    .listen(port)
    .on('listening', () => {
      // -------- Welcome Screen -------- //
      console.log(
        `
  ${text(`DerivedCMS @${port.toString()}`)} ${emoji.get('coffee')}

  ${section`Variables`}
  ${Object.keys(process.env).reduce((acc, k) => {
    if (isEnvVar.test(k)) {
      acc += `${symbol('=>')} ${vName(k)}${symbol`:`} ${vVal(
        process.env[k] || err('undefined')
      )}\n  `
    }
    return acc
  }, '')}

  ${section`Routes`}
${[...router.stack, ...authRouter.stack]
  .map(
    l =>
      `  ${symbol`=>`} ${method(l.methods.join(' | ') || '*')} ${path(
        l.path || l.regexp.source
      )}`
  )
  .join('\n')}

  ${section('Static')}${symbol(':')} ${path(staticDir)}  
`
      )
    })
})()
