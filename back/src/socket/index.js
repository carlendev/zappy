const { logInfoSocket } = require('../utils/logger')
const { io } = require('../app')
const { clientPnw, validateJson } = require('../utils/validator')
const { createHub, deleteHub } = require('./hub/index') 
const { connectFront } = require('./front/index')
const { connect, disconnect } = require('./client/index')
const { moveForward, moveRight, moveLeft } = require('./action/index')
const { set, get } = require('../utils/redisfn')

const socket = () => {
    const clients = {}
    const hubs = {}

    io.on('connection', client => {  

        //INFO: CLIENT events
        client.on('join', data => connect(data, clients, client, io))
        client.on('disconnect', data => disconnect(data, clients, client))

        //INFO: FRONT events
        client.on('connectFront', data => connectFront(data, clients, client, hubs))

        //INFO: HUB events
        client.on('createHub', data => createHub(data, clients, client, hubs))
        //TODO: (carlendev) delete all the client in this hub
        client.on('deleteHub', data => deleteHub(data, clients, client, hubs))

        //INFO: Protocol ia -> server
        //TODO (hitier_g): create job directly with callback + timer
        client.on('Forward', data => moveForward(data, clients, client, hubs))
        client.on('Right', data => moveRight(data, clients, client, hubs))
        client.on('Left', data => moveLeft(data, clients, client, hubs))

    })
}

module.exports = socket
