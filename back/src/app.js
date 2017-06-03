const express = require('express')
const mapAPI = require('./api/map/index')
const bodyParser = require('body-parser')
const { initializeRedis } = require('./utils/startup')
const { jsonSchemaError, jsonSyntaxError } = require('./utils/middleware')

require('dotenv').config()

const app = express()

const server = require('http').createServer(app)
const io = require('socket.io')(server)

const handleError = err => {
    console.error(err)
    process.exit(1)
}

const PORT = +process.env.PORT || 3001

//middleware
app.use(bodyParser.json())


//route
app.use('/api', mapAPI)


//error middleware
app.use(jsonSyntaxError)
app.use(jsonSchemaError)

initializeRedis()
    .then(() => app.listen(PORT, err => err ? handleError(err) : console.log(`App listen to ${PORT}`)))
    .catch(handleError)