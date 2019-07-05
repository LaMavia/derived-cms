import Koa from 'koa'
import KoaRouter from 'koa-router'
import dotenv from 'dotenv'
import emoji from 'node-emoji'
import KoaStatic from 'koa-static'
import cors from '@koa/cors'
import KoaLogger from 'koa-logger'
import fs from 'fs-extra'
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

// -------- /Routes -------- //

import { resolve } from 'path'
import { DbInterface } from './class/DbInterface'
import { MongoDatabase } from './components/database'
import { KoaConext } from './context'
;(async () => {
  const app = new Koa<any, KoaConext>()
  const router = new KoaRouter<any, KoaConext>()

  const staticDir = resolve('./client/build')
  const staticServer = KoaStatic(staticDir)

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
  router.use(dbApi.middleware()).use(index.middleware())

  dotenv.config({
    debug: true,
  })

  const port = +(process.env['DC_PORT'] || 8000)
  const isEnvVar = /^DC_/
  const db: DbInterface = new MongoDatabase(schemas)
  await db.connect()
  // setInterval(() => {
  //   db.save_schemas()
  // }, 60000)
  app.context.db = db

  app
    .use(
      cors({
        origin: '*',
      })
    )
    .use(KoaLogger())
    .use(staticServer)
    .use(router.middleware())
    .use(router.allowedMethods())
    .listen(port)
    .on('listening', () => {
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
      `  ${symbol`=>`} ${method(l.methods.join(' | '))} ${path(
        l.path || l.regexp.source
      )}`
  )
  .join('\n')}

  ${section('Static')}${symbol(':')} ${path(staticDir)}  
`
      )
    })
})()
