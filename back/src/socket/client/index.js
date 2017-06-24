const { logInfoSocket, logQInfo, logQError } = require('../../utils/logger')
const { clientPnw, validateJson } = require('../../utils/validator')
const { createHub, deleteHub } = require('../hub/index')
const { connectFront } = require('../front/index')
const { set, get, findClients, findHubs, setClients } = require('../../utils/redisfn')
const { createHubQ, createHubJob } = require('../../queue/index')
const { randTile } = require('../../utils/map')

let _clients = {}

const emitDead = (client, msg) => {
    logInfoSocket(msg)
    client.emit('dead')
}

const registerClient = (clients, client, data, nbTeam, nbPlayerMax, playerPos, io) => {
    clients[ client.id ] = { socket: client, id: client.id, front: false, hub: data.hubName, team: data.team }
    _clients = clients
    logInfoSocket('Client connected ' + client.id)
    findClients('').then(([ add ]) => {
        const id = client.id
        add.push(Object.assign(data, { id, pos: playerPos, orientation: 1 }))
        set('clients', JSON.stringify(add)).then(e => {
            createHubQ(id, userEvents)
            findClients('').then(([ _clients ]) => {
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
    if (validateJson(clientPnw)(data).errors.length) return emitDead(client, 'Wrong parameters types')
    findHubs(data.hubName).then(async ([ _hubs, currentHub ]) => {
        if (!_hubs.length) return emitDead(client, 'Connection rejected, no hubs found')
        if (!_hubs.find(e => e.hubName === data.hubName)) return emitDead(client,`Connection rejected, ${data.hubName} hub not found`)
        if (!currentHub.teams.find(e => e === data.team)) return emitDead(client, `Connection rejected, ${data.team} team not found`)
        const team = _hubs.find(e => e.team === data.team)
        const nbTeam = currentHub.teams.length
        const nbPlayerMax = +currentHub.clientsPerTeam
        const _clients = JSON.parse(await get('clients'))
        const playerInHub = _clients.filter(e => e.hubName === data.hubName)
        const playerPos = randTile(currentHub.mapWidth, currentHub.mapHeight)
        if (!playerInHub.length) return registerClient(clients, client, data, nbTeam, nbPlayerMax, playerPos, io)
        const nbPlayer = playerInHub.length
        if (nbPlayer === nbPlayerMax * nbTeam) return emitDead(client, `Connection rejected, ${data.hubName} to much player in this hub`)
        const playerInTeam = playerInHub.find(e => e.team === data.team)
        if (playerInTeam === undefined || playerInTeam === null) return registerClient(clients, client, data, nbTeam, nbPlayerMax, playerPos, io)
        if (playerInTeam.length === currentHub.nbPlayerMax) return emitDead(client, `Connection rejected, ${data.hubName} to much player in this team`)
        return registerClient(clients, client, data, nbTeam, nbPlayerMax, io)
    })
}

const disconnect = (data, clients, client) => {
    if (clients[ client.id ].front) {
        delete clients[ client.id ]
        _clients = clients
        return
    }
    findClients(client.id).then(([ __clients, _client ]) => {
        const _new = __clients.filter(e => e.id !== client.id)
        setClients(_new, (clients, client) => {
            delete clients[ client.id ]
            _clients = clients
            logInfoSocket('Client disconnected ' + client.id)
        }, clients, client)
    })
}

const forward = (data, clients, client) => findClients(client.id).then(([ _clients, _client ]) =>
    findHubs(_client.hubName).then(([ _hubs, _hub ]) => {
        switch (_client.orientation) {
        case 1:
            if (--_client.pos.y < 0) _client.pos.y = _hub.mapHeight - 1
            break
        case 2:
            if (--_client.pos.x) _client.pos.x = _hub.mapWidth - 1
            break
        case 3:
            _client.pos.y = (_client.pos.y + 1) % _hub.mapHeight
            break
        case 4:
            _client.pos.x = (_client.pos.x + 1) % _hub.mapWidth
            break
        }
    setClients(_clients, _client => logInfoSocket('New pos is: ' + JSON.stringify(_client.pos)), _client)
}))

const left = (data, clients, client) => findClients(client.id).then(([ _clients, _client ]) => {
    if (--_client.orientation < 1) _client.orientation = 4
    setClients(_clients, _client => logInfoSocket('New orientation is: ' + _client.orientation), _client)
})

const right = (data, clients, client) => findClients(client.id).then(([ _clients, _client ]) => {
    if (_client.orientation > 4) _client.orientation = 1
    setClients(_clients, _client => logInfoSocket('New orientation is: ' + _client.orientation), _client)
})

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