const express = require('express')
const mapAPI = require('./api/map/index')
const bodyParser = require('body-parser')
const _io = require('socket.io')
const { logInfo, logError } = require('./utils/logger')
const { initializeRedis } = require('./utils/startup')
const { jsonSchemaError, jsonSyntaxError } = require('./utils/middleware')

require('dotenv').config()

const app = express()

//socket
const server = require('http').createServer(app)

//middleware
app.use(bodyParser.json())

//route
app.use('/api', mapAPI)

//error middleware
app.use(jsonSyntaxError)
app.use(jsonSchemaError)

const handleError = err => {
    logError(err)
    process.exit(1)
}

const PORT = +process.env.PORT || 3001

initializeRedis()
    .then(() => {
        const server = app.listen(PORT, err => err ? handleError(err) : logInfo(`App listen to ${PORT}`))
        const io = _io(server)
        module.exports = { io }
        require('./socket/index')()
    })
    .catch(handleError)