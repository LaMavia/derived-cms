import Koa from 'koa'
import KoaRouter from 'koa-router'
import dotenv from 'dotenv'
import emoji from 'node-emoji'
import KoaStatic from 'koa-static'
import cors from '@koa/cors'
import KoaLogger from 'koa-logger'
import KoaBody from 'koa-body'
import fs from 'fs-extra'
import jwt from 'koa-jwt'
import mount from 'koa-mount'
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

  const staticDir = resolve('./client/build')
  const dataDir = resolve('./data')

  process.env['DC_DATA_PATH'] = dataDir
  const schemas: HashMap<Model> = await fs
    .readFile(resolve(dataDir, 'models.json'), 'utf-8')
    // Preventing JSON.parse error, when the app is being initialized for the first time
    .then(data => {
      console.log(data)
      return JSON.parse(data || '{}')
    })
    .catch(err => {
      console.error(err)
      return {}
    })

  // Join routers
  router
    .use(index.middleware())
    // -------- Guarded Routes [exc: auth/signup, auth/signin] -------- //
    // .use(jwt({ secret }).unless({ path: [/sign/] }))
    .use(dbApi.middleware())
    .use(authRouter.middleware())

  dotenv.config({
    debug: true,
  })

  const port = +(process.env['DC_PORT'] || 8000)
  const isEnvVar = /^DC_/

  // -------- Init Database -------- //
  const db: DbInterface = new MongoDatabase(schemas)
  await db.connect()

  // -------- Init UsersManager -------- //
  const usersManager = new UsersManager()

  // -------- Init "CRON" jobs -------- //
  // setInterval(() => {
  //   db.save_schemas()
  // }, 60000)

  // -------- Init Context -------- //
  app.context.db = db
  app.context.usersManager = usersManager
  app.context.secret = secret
  app.context.sessionsManager = new SessionStorage(app)

  app
    .use(
      cors({
        origin: '*',
      })
    )
    .use(KoaLogger())
    .use(KoaBody())
    .use(mount('/static', KoaStatic(staticDir, {})))
    .use(sessionMiddleware([/\/auth/]))
    .use(router.middleware())
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
${router.stack
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
