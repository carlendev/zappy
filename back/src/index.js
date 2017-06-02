const express = require('express')
const mapAPI = require('./api/map/index')
const { initializeRedis } = require('./utils/startup')
const bodyParser = require('body-parser')

require('dotenv').config()

const app = express()

const handleError = err => {
    console.error(err)
    process.exit(1)
}

const PORT = +process.env.PORT || 3001

//middleware
app.use(bodyParser.json())

//route
app.use('/api', mapAPI)

initializeRedis
    .then(() => app.listen(PORT, err => err ? handleError(err) : console.log(`App listen to ${PORT}`)))
    .catch(handleError)
