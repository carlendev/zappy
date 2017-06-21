const redis = require('./redis')
const { set, send } = require('./redisfn')
const { mapSize, ressourceRatio } = require('../config')

const initMapSize = () => set('mapSize', mapSize)

const initRessourceRatio = () => set('ressourceRatio', ressourceRatio)

const flush = () => send('FLUSHALL')

const initClients = () => set('clients', JSON.stringify([]))

const initHubs = () => set('hubs', JSON.stringify([]))
 
const initializeRedis = () => new Promise((s, f) => flush()
    .then(initMapSize)
    .then(initClients)
    .then(initHubs)
    .then(initRessourceRatio)
    .then(s)
    .catch(f))

module.exports = { initializeRedis }