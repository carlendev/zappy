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

        //TODO: check team place, if all players, emit event play
        client.on('pnw', data => {
            if (validateJson(clientPnw)(data).errors.length) {
                client.emit('dead')
                return
            }
            get('hubs').then(async e => {
                const _hubs = JSON.parse(e)
                if (!_hubs.length) {
                    logInfoSocket('Connection rejected, no hubs found')
                    client.emit('dead')
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
                //TODO: check if team is complete or not and if it is complete launch game
                const team = _hubs.find(e => e.team === data.team)
                const nbTeam = currentHub.teams.length
                const nbPlayerMax = +currentHub.clientsPerTeam
                const _clients = JSON.parse(await get('clients'))
                const playerInHub = _clients.filter(e => e.hubName === data.hubName)
                if (!playerInHub.length) {
                    clients[ client.id ] = { socket: client, id: client.id, front: false, hub: data.hubName, team: data.team }
                    logInfoSocket('Client connected ' + client.id)
                    return get('clients').then(e => {
                        const add = JSON.parse(e)
                        const id = client.id
                        add.push(Object.assign(data, { id }))
                        set('clients', JSON.stringify(add))
                    })  
                }
                const nbPlayer = playerInHub.length
                if (nbPlayer === nbPlayerMax * nbTeam) {
                    logInfoSocket(`Connection rejected, ${data.hubName} to much player in this hub`)
                    client.emit('dead')
                    return                    
                }
                const playerInTeam = playerInHub.find(e => e.team === data.team)
                if (playerInTeam.length === currentHub.nbPlayerMax) {
                    logInfoSocket(`Connection rejected, ${data.hubName} to much player in this team`)
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
