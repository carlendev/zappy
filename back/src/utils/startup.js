const redis = require('./redis')
const { set } = require('./redisfn')
const { mapSize } = require('../config')

const initMapSize = set('mapSize', +mapSize)

const initializeRedis = new Promise((s, f) => initMapSize
    .then(s)
    .catch(f))

module.exports = { initializeRedis }