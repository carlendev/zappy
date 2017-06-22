const { logInfoSocket } = require('../utils/logger')
const { io } = require('../app')
const { clientPnw, validateJson } = require('../utils/validator')
const { createHub, deleteHub } = require('./hub/index')
const { connectFront } = require('./front/index')
const { set, get } = require('../utils/redisfn')

const socket = () => {
    const clients = {}
    const hubs = {}

    io.on('connection', client => {  
        logInfoSocket('Client connected')

        client.on('pnw', data => {
            if (validateJson(clientPnw)(data).errors.length) {
                client.emit('dead')
                return
            }
            get('hubs').then(e => {
                const _hubs = JSON.parse(e)
                if (!_hubs.length) {
                    logInfoSocket('Connection rejected, no hubs found')
                    return
                }
                if (!_hubs.find(e => e.hubName === data.hubName)) {
                    logInfoSocket(`Connection rejected, ${data.hubName} hub not found`)
                    client.emit('dead')
                    return                    
                }
                const currentHub = _hubs.find(e => e.hubName === data.hubName)
                if (!currentHub.teams.find(e => e === data.team)) {
                    logInfoSocket(`Connection rejected, ${data.team} team not found`)
                    client.emit('dead')
                    return                                        
                }
                clients[ client.id ] = { socket: client, id: client.id, front: false, hub: data.hubName, team: data.team }
                logInfoSocket('Client connected ' + client.id)
                get('clients').then(e => {
                    const add = JSON.parse(e)
                    const id = client.id
                    add.push(Object.assign(data, { id }))
                    set('clients', JSON.stringify(add))
                })
            })
        })

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
