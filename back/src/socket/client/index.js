const { logInfoSocket, logQInfo, logQError } = require('../../utils/logger')
const { clientPnw, validateJson } = require('../../utils/validator')
const { createHub, deleteHub } = require('../hub/index')
const { set, get, findClients, findClientsInHub, findHubs, setClients } = require('../../utils/redisfn')
const { createHubQ, createHubJob } = require('../../queue/index')
const { randTile, circularPos } = require('../../utils/map')

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
        add.push(Object.assign(data, { id, pos: playerPos, orientation: 1, lvl: 2, nbActions: 0, inventory: { food: 0, linemate: 0, deraumere: 0, sibur: 0, mendiane: 0, phiras: 0, thystame: 0 } }))
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

const connectFront = (_, clients, client) => {
    clients[ client.id ] = { socket: client, id: client.id, front: true }
    _clients = clients
    logInfoSocket('Front connected')
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
            case 1: --_client.pos.y; break
            case 2: --_client.pos.x; break
            case 3: ++_client.pos.y; break
            case 4: ++_client.pos.x; break
        }
        _client.pos = circularPos(_client.pos, _hub.mapWidth, _hub.mapHeight)
    setClients(_clients, _client => {logInfoSocket('New pos is: ' + JSON.stringify(_client.pos)); client.socket.emit('ok')}, _client)
}))

const left = (data, clients, client) => findClients(client.id).then(([ _clients, _client ]) => {
    if (--_client.orientation < 1) _client.orientation = 4
    setClients(_clients, _client => {logInfoSocket('New orientation is: ' + _client.orientation); client.socket.emit('ok')}, _client)
})

const right = (data, clients, client) => findClients(client.id).then(([ _clients, _client ]) => {
    if (_client.orientation > 4) _client.orientation = 1
    setClients(_clients, _client => {logInfoSocket('New orientation is: ' + _client.orientation); client.socket.emit('ok')}, _client)
})

const look = (data, clients, client) => findClients(client.id).then(([ _clients, _client ]) => {
    findHubs(_client.hubName).then(([ _hubs, _hub ]) => {
        let res = []
            
        const getRow = (pos, forward, nb, xForward, yForward, xLeft, yLeft) => {
            const x = pos.x + xForward * forward
            const y = pos.y + yForward * forward
            if (nb - 1 === 0) return res.push({ x , y })
            for (let i = 0; i < nb; ++i) {
                const off = (nb - 1) / 2
                if (i === off) res.push(circularPos({ x , y }, _hub.mapWidth, _hub.mapHeight))
                else if (i < off) res.push(circularPos({ x: x + (xLeft * (off - i)), y: y + (yLeft * (off - i)) }, _hub.mapWidth, _hub.mapHeight))
                else if (i > off) res.push(circularPos({ x: x + (-xLeft * (i - off)), y: y + (-yLeft * (i - off)) }, _hub.mapWidth, _hub.mapHeight))
            }
        }

        let nb = 1
        for (let forward = 0; forward < _client.lvl; ++forward) {
            switch (_client.orientation) {
                case 1: getRow(_client.pos, forward, nb, 0, -1, -1, 0); break
                case 2: getRow(_client.pos, forward, nb, 1, 0, 0, -1); break
                case 3: getRow(_client.pos, forward, nb, 0, 1, 1, 0); break
                case 4: getRow(_client.pos, forward, nb, -1, 0, 0, 1); break
            }
            nb += 2
        }
        findClientsInHub(_client.hubName).then(_clients => {
            client.socket.emit('look', res.map(p => Object.assign( {}, { players: _clients.filter(e => p.y === e.pos.y && p.x === e.pos.x).length }, _hub.map[p.y][p.x] )))
        })
    })
})

const inventory = (data, clients, client) => findClients(client.id).then(([ _clients, _client ]) => { client.socket.emit('inventory', _client.inventory) })

const userEvents = async (job, done) => {
    const data = job.data
    const client = _clients[ data.client_id ]
    const fronts = Object.keys(_clients).filter(e => _clients[e].front === true)
    const hubs = JSON.parse(await get('hubs'))
    const hubInfo = hubs.find(e => e.name === client.hubName)
    const clients = JSON.parse(await get('clients'))
    const rClient = clients.find(e => e.id === data.client_id)
    if (rClient.nbActions >= 10) {
        client.socket.emit('ko')
        return done()
    }
    ++rClient.nbActions
    await set('clients', JSON.stringify(clients))
    const id = rClient.id
    setTimeout(async () => {
        data.fn && eval(data.fn + '(data, clients, client)')
        const __clients = JSON.parse(await get('clients'))
        const _client = __clients.find(e => e.id === id)
        --_client.nbActions
        set('clients', JSON.stringify(__clients))
        fronts.map(e => _clients[e].socket.emit(`update:${client.hub}`, { hubInfo, clients }))
        client.socket.emit(data.id)
        done()
    }, data.time * 1000)
}

module.exports = { connect, disconnect, connectFront }