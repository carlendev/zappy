const { logInfoSocket, logQInfo } = require('../../utils/logger')
const { clientPnw, validateJson } = require('../../utils/validator')
const { createHub, deleteHub } = require('../hub/index') 
const { connectFront } = require('../front/index')
const { set, get } = require('../../utils/redisfn')
const { createHubQ, createHubJob } = require('../../queue/index')

let _clients = {}

const registerClient = (clients, client, data, nbTeam, nbPlayerMax, io) => {
    clients[ client.id ] = { socket: client, id: client.id, front: false, hub: data.hubName, team: data.team }
    _clients = clients
    logInfoSocket('Client connected ' + client.id)
    get('clients').then(e => {
        const add = JSON.parse(e)
        const id = client.id
        add.push(Object.assign(data, { id }))
        set('clients', JSON.stringify(add)).then(e => {
            createHubQ(id, userEvents)
            get('clients').then(e => {
                const _clients = JSON.parse(e)
                const playerInHub = _clients.filter(e => e.hubName === data.hubName)
                if (playerInHub.length !== nbPlayerMax * nbTeam) return 
                io.emit('play')
                const front_id = Object.keys(clients).find(e => clients[e].front === true)
                playerInHub.map(e => createHubJob(e.id, { hub: e.hub, id: 'start', title: 'Start game', client_id: e.id, front_id, frame: 100 },
                                () => logQInfo('Start game')))
            })
        })
    })        
}

const connect = (data, clients, client, io) => {
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
        const team = _hubs.find(e => e.team === data.team)
        const nbTeam = currentHub.teams.length
        const nbPlayerMax = +currentHub.clientsPerTeam
        const _clients = JSON.parse(await get('clients'))
        const playerInHub = _clients.filter(e => e.hubName === data.hubName)
        if (!playerInHub.length) return registerClient(clients, client, data, nbTeam, nbPlayerMax, io)
        const nbPlayer = playerInHub.length
        if (nbPlayer === nbPlayerMax * nbTeam) {
            logInfoSocket(`Connection rejected, ${data.hubName} to much player in this hub`)
            client.emit('dead')
            return                    
        }
        const playerInTeam = playerInHub.find(e => e.team === data.team)
        if (playerInTeam === undefined || playerInTeam === null) return registerClient(clients, client, data, nbTeam, nbPlayerMax, io)
        if (playerInTeam.length === currentHub.nbPlayerMax) {
            logInfoSocket(`Connection rejected, ${data.hubName} to much player in this team`)
            client.emit('dead')
            return                                        
        }
        return registerClient(clients, client, data, nbTeam, nbPlayerMax, io)
    })
}

const disconnect = (data, clients, client) => {
    if (clients[ client.id ].front) {
        delete clients[ client.id ]
        _clients = clients
        return
    }
    get('clients').then(e => {
        const rm = JSON.parse(e)
        const id = client.id
        const _new = rm.filter(e => e.id !== id)
        set('clients', JSON.stringify(_new)).then(() => {
            delete clients[ client.id ]
            _clients = clients
        })
        logInfoSocket('Client disconnected ' + client.id)
    })
}


const forward = (data, clients, client) => {
}

const userEvents = (job, done) => {
    const data = job.data
    const client = _clients[ data.client_id ]
    const front = _clients[ data.front_id ]
    client.socket.emit(data.id)
    front.socket.emit('update')
    done()
}

module.exports = { connect, disconnect }