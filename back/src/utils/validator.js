const _validate = require('express-jsonschema').validate
const R = require('ramda')
const Validator = require('jsonschema').Validator
const v = new Validator()

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

const clientPnw = {
    properties: {
      hub: { type: 'integer' },
      team: { type: 'integer' }
    }
}

const deleteHub = {
    properties: {
      id: { type: 'integer' }
    }
}

const toBody = obj => ({ body : obj })

const validate = R.compose(_validate, toBody)

const validateJson =  fn => p => v.validate(p, fn)

module.exports = { mapSizeMapAPI, clientPnw, deleteHub, validate, validateJson }