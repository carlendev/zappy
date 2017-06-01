const express = require('express')
const mapAPI = require('./api/map/index')
require('dotenv').config()

const app = express()

const handleError = err => {
    console.error(err)
    process.exit(1)
}

const PORT = +process.env.PORT || 3001

app.use('/api', mapAPI)

app.listen(PORT, err => err ? handleError(err) : console.log(`App listen to ${PORT}`))
