const redis = require('./redis')
const { set, send } = require('./redisfn')
const { mapSize } = require('../config')

const initMapSize = () => set('mapSize', +mapSize)

const flush = () => send('FLUSHALL')

const initClients = () => set('clients', JSON.stringify([]))

const initHubs = () => set('hubs', JSON.stringify([]))
 
const initializeRedis = () => new Promise((s, f) => flush()
    .then(initMapSize)
    .then(initClients)
    .then(initHubs)
    .then(s)
    .catch(f))

module.exports = { initializeRedis }