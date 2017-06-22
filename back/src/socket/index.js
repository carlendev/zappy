const { logInfoSocket } = require('../utils/logger')
const { io } = require('../app')
const { clientPnw, validateJson } = require('../utils/validator')
const { createHub, deleteHub } = require('./hub/index') 
const { connectFront } = require('./front/index')
const { connect } = require('./client/index')
const { set, get } = require('../utils/redisfn')

const socket = () => {
    const clients = {}
    const hubs = {}

    io.on('connection', client => {  

        client.on('connect', data => connect(data, clients, client, io))

        client.on('disconnect', () => {
            if (clients[ client.id ].front) {
                delete clients[ client.id ]
                return
            }
            get('clients').then(e => {
                const rm = JSON.parse(e)
                const id = client.id
                const _new = rm.filter(e => e.id !== id)
                set('clients', JSON.stringify(_new)).then(() => delete clients[ client.id ])
                logInfoSocket('Client disconnected ' + client.id)
            })
        })

        //INFO: FRONT events
        client.on('connectFront', data => connectFront(data, clients, client, hubs))

        //INFO: HUB events
        client.on('createHub', data => createHub(data, clients, client, hubs))
        //TODO: (carlendev) delete all the client in this hub
        client.on('deleteHub', data => deleteHub(data, clients, client, hubs))
    })
}

module.exports = socket
