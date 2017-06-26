const { logInfoSocket } = require('../utils/logger')
const { io } = require('../app')
const { clientPnw, validateJson } = require('../utils/validator')
const { createHub, deleteHub } = require('./hub/index') 
const { connect, disconnect, connectFront } = require('./client/index')
const { Forward, Right, Left, Look, Inventory } = require('./action/index')
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
        client.on('Forward', data => Forward(data, clients, client, hubs))
        client.on('Right', data => Right(data, clients, client, hubs))
        client.on('Left', data => Left(data, clients, client, hubs))
        client.on('Look', data => Look(data, clients, client, hubs))
        client.on('Inventory', data => Inventory(data, clients, client, hubs))
    })
}

module.exports = socket
