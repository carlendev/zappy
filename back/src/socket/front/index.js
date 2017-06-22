const { logInfoSocket } = require('../../utils/logger')
const { clientPnw, deleteHubP, validateJson } = require('../../utils/validator')
const { set, get } = require('../../utils/redisfn')

const connectFront = (_, clients, client) => {
    clients[ client.id ] = { socket: client, id: client.id, front: true }
    logInfoSocket('Front connected')
}

module.exports = { connectFront }