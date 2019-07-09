const cl = require('cluster')
const { cpus } = require('os')
const { resolve } = require('path')
cl.setupMaster({
  exec: resolve(__dirname, './index'),
})
for (let i = 0; i < cpus().length; i++) {
  cl.fork()
}
