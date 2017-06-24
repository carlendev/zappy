const { logInfoSocket, logQInfo, logQError } = require('../../utils/logger')
const { clientPnw, validateJson } = require('../../utils/validator')
const { createHub, deleteHub } = require('../hub/index')
const { connectFront } = require('../front/index')
const { set, get } = require('../../utils/redisfn')
const { createHubQ, createHubJob } = require('../../queue/index')
const { randTile } = require('../../utils/map')

let _clients = {}

const registerClient = (clients, client, data, nbTeam, nbPlayerMax, playerPos, io) => {
    clients[ client.id ] = { socket: client, id: client.id, front: false, hub: data.hubName, team: data.team }
    _clients = clients
    logInfoSocket('Client connected ' + client.id)
    get('clients').then(e => {
        const add = JSON.parse(e)
        const id = client.id
        add.push(Object.assign(data, { id, pos: playerPos, orientation: 1 }))
        set('clients', JSON.stringify(add)).then(e => {
            createHubQ(id, userEvents)
            get('clients').then(e => {
                const _clients = JSON.parse(e)
                const playerInHub = _clients.filter(e => e.hubName === data.hubName)
                if (playerInHub.length !== nbPlayerMax * nbTeam) return 
                io.emit('play')
                const front_id = Object.keys(clients).find(e => clients[e].front === true)
                playerInHub.map(e => createHubJob(e.id, { hub: e.hub, id: 'start', title: 'Start game', client_id: e.id, front_id },
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
        const playerPos = randTile(currentHub.mapWidth, currentHub.mapHeight)
        if (!playerInHub.length) return registerClient(clients, client, data, nbTeam, nbPlayerMax, playerPos, io)
        const nbPlayer = playerInHub.length
        if (nbPlayer === nbPlayerMax * nbTeam) {
            logInfoSocket(`Connection rejected, ${data.hubName} to much player in this hub`)
            client.emit('dead')
            return                    
        }
        const playerInTeam = playerInHub.find(e => e.team === data.team)
        if (playerInTeam === undefined || playerInTeam === null) return registerClient(clients, client, data, nbTeam, nbPlayerMax, playerPos, io)
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
    get('clients').then(e => {
        const _clients = JSON.parse(e)
        const _client = _clients.find(c => c.id === client.id)
        const _index = _clients.findIndex(c => c.id === client.id)
        get('hubs').then(e => {
            _hubs = JSON.parse(e)
            _hub = _hubs.find(h => h.hubName === _client.hubName)
            switch (_clients[_index].orientation) {
                case 1:
                    if (--_clients[_index].pos.y < 0)
                        _clients[_index].pos.y = _hub.mapHeight - 1
                    break
                case 2:
                    if (--_clients[_index].pos.x)
                        _clients[_index].pos.x = _hub.mapWidth - 1
                    break
                case 3:
                    _clients[_index].pos.y = (_clients[_index].pos.y + 1) % _hub.mapHeight
                    break
                case 4:
                    _clients[_index].pos.x = (_clients[_index].pos.x + 1) % _hub.mapWidth
                    break
            }
            set('clients', JSON.stringify(_clients)).then(() => {
                console.log('New pos is: ', _clients[_index].pos)
            })
        })
    })
}

const left = (data, clients, client) => {
    get('clients').then(e => {
        const _clients = JSON.parse(e)
        const _client = _clients.find(c => c.id === client.id)
        const _index = _clients.findIndex(c => c.id === client.id)
        if (--_clients[_index].orientation < 1)
            _clients[_index].orientation = 4
        set('clients', JSON.stringify(_clients)).then(() => {
            console.log('New orientation is: ', _clients[_index].orientation)
        })
    })
}

const right = (data, clients, client) => {
    get('clients').then(e => {
        const _clients = JSON.parse(e)
        const _client = _clients.find(c => c.id === client.id)
        const _index = _clients.findIndex(c => c.id === client.id)
        if (++_clients[_index].orientation > 4)
            _clients[_index].orientation = 1
        set('clients', JSON.stringify(_clients)).then(() => {
            console.log('New orientation is: ', _clients[_index].orientation)
        })
    })
}

const userEvents = async (job, done) => {
    const data = job.data
    const client = _clients[ data.client_id ]
    const front = _clients[ data.front_id ]
    const hubs = JSON.parse(await get('hubs'))
    const hubInfo = hubs.find(e => e.name === client.hubName)
    const clients = JSON.parse(await get('clients'))
    setTimeout(() => {
        data.fn && eval(data.fn + '(data, _clients, client)')
        client.socket.emit(data.id)
        front.socket.emit('update', { hubInfo, clients })
        done()
    }, data.time * 1000)
}

module.exports = { connect, disconnect }