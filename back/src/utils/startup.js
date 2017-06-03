const redis = require('./redis')
const { set, send } = require('./redisfn')
const { mapSize } = require('../config')

const initMapSize = () => set('mapSize', +mapSize)

const flush = () => send('FLUSHALL')

const initializeRedis = () => new Promise((s, f) => flush()
    .then(initMapSize)
    .then(s)
    .catch(f))

module.exports = { initializeRedis }