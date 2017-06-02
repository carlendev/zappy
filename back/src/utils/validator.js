const _validate = require('express-jsonschema').validate
const R = require('ramda')

const type = 'object'

const mapSizeMapAPI = {
    properties: {
        mapSize: {
            type: 'number',
            minimum: 7,
            maximum: 100,
            required: true
        }
    }
}

const toBody = obj => ({ body : obj })

const validate = R.compose(_validate, toBody)

module.exports = { mapSizeMapAPI, validate }