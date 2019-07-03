import Koa from 'koa'
import KoaRouter from 'koa-router'
import dotenv from 'dotenv'
import emoji from 'node-emoji'
import KoaStatic from 'koa-static'
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
import { resolve } from 'path'
import { DbInterface } from './class/DbInterface'
import { MongoDatabase } from './components/database'
;(async () => {
  const app = new Koa()
  const router = new KoaRouter()
  const staticDir = resolve('./client/build')
  const staticServer = KoaStatic(staticDir)

  const dataDir = resolve('./data')
  const schemas: HashMap<Model> = await fs
    .readFile(resolve(dataDir, 'models.json'), 'utf-8')
    .then(JSON.parse)
    .catch(err => {
      console.error(err)
      return {}
    })

  router.use(index.routes())

  dotenv.config({
    debug: true,
  })

  const port = +(process.env['DC_PORT'] || 8000)
  const isEnvVar = /^DC_/
  const db: DbInterface = new MongoDatabase(schemas)
  await db.connect()

  app
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
  ${router.stack.map(
    l =>
      `${symbol`=>`} ${method(l.methods.join(' | '))} ${path(
        l.path || l.regexp.source
      )}\n`
  )}
  ${section('Static')}${symbol(':')} ${path(staticDir)}  
`
      )
    })
})()
