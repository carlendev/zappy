const express = require('express')
const mapAPI = require('./api/map/index')
const hubAPI = require('./api/hub/index')
const teamAPI = require('./api/team/index')
const bodyParser = require('body-parser')
const _io = require('socket.io')
const kue = require('kue')
const { logInfo, logError } = require('./utils/logger')
const { initializeRedis } = require('./utils/startup')
const { jsonSchemaError, jsonSyntaxError } = require('./utils/middleware')
const { createHubQ } = require('./queue/index')
const { fuckEvents } =require('./socket/client/index')
const cors = require('cors')
const argv = require('argv')

const args = argv.option([
    {
        name: 'port',
        short: 'p',
        type: 'number',
        description: 'Is the port number',
        example: "-p=3001 or --port=3001"
    }
]).run()

const PORT = args.options.port || 3001

require('events').EventEmitter.prototype._maxListeners = 10000

require('dotenv').config()

const app = express()

//socket
const server = require('http').createServer(app)

//middleware
app.use(bodyParser.json())
app.use(cors())

//kue
require('./queue/index')
app.use('/queue', kue.app)

//route
app.use('/api', mapAPI)
app.use('/api', hubAPI)
app.use('/api', teamAPI)

//error middleware
app.use(jsonSyntaxError)
app.use(jsonSchemaError)

const handleError = err => {
  logError(err)
  process.exit(1)
}

initializeRedis()
  .then(() => {
    const server = app.listen(
      PORT,
      err => (err ? handleError(err) : logInfo(`App listen to ${PORT}`))
    )
    createHubQ('fuckQ', fuckEvents)
    const io = _io(server)
    module.exports = { io }
    require('./socket/index')()
  })
  .catch(handleError)
