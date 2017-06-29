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
      hubName: { type: 'string' },
      team: { type: 'string' }
    }
}

const createHubP = {
    properties: {
        hubName: { type: 'string' },
        mapWidth: { type: 'number' },
        mapHeight: { type: 'number' },
        teams: { type: 'array', items: { type: 'string' }, minItems: 1, uniqueItems: true },
        clientsPerTeam: { type: 'number' },
        freq: { type: 'number' }
    }
}

const deleteHubP = {
    properties: {
      id: { type: 'integer' }
    }
}

const toBody = obj => ({ body : obj })

const validate = R.compose(_validate, toBody)

const validateJson =  fn => p => v.validate(p, fn)

module.exports = { mapSizeMapAPI, clientPnw, createHubP, deleteHubP, validate, validateJson }