const redis = require('./redis')

const get = key => redis.getAsync(key)

const set = (key, value) => redis.setAsync(key, value)

const send = cmd => redis.send_commandAsync(cmd)

const findClients = id => new Promise(s => get('clients').then(e => {
    const _clients = JSON.parse(e)
    s([ _clients, _clients.find(c => c.id === id) ])
}))

const findHubs = hubName => new Promise(s => get('hubs').then(e => {
    _hubs = JSON.parse(e)
    s([ _hubs, _hubs.find(h => h.hubName === hubName) ])
}))

const setClients = (clients, fn, ...args) => set('clients', JSON.stringify(clients)).then(() => fn(...args))

module.exports = { get, set, send, findClients, findHubs, setClients }