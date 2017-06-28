const { logInfoSocket, logQInfo, logQError } = require('../../utils/logger')
const { clientPnw, validateJson, createHubP, deleteHubP } = require('../../utils/validator')
const { set, get, decr, findClients, findClientsInHub, findHubs, setClients } = require('../../utils/redisfn')
const { createHubQ, createHubJob } = require('../../queue/index')
const { randTile, circularPos, generateMap } = require('../../utils/map')

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
        add.push(Object.assign(data, { id, pos: playerPos, orientation: 1, lvl: 2, nbActions: 0,
            inventory: { food: 10, linemate: 0, deraumere: 0, sibur: 0, mendiane: 0, phiras: 0, thystame: 0 } }))
        set('clients', JSON.stringify(add)).then(e => {
            set(client.id, 0).then(() => {
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
        findClientsInHub(_client.hubName).then(_clients => 
            client.socket.emit('look', res.map(p =>
                Object.assign({}, { players: _clients.filter(e => p.y === e.pos.y && p.x === e.pos.x).length }, _hub.map[p.y][p.x]))))
    })
})

const inventory = (data, clients, client) => findClients(client.id).then(([ _clients, _client ]) => { client.socket.emit('inventory', _client.inventory) })

const connectnbr = (data, clients, client) => findClients(client.id).then(([ _clients, _client ]) => findHubs(_client.hubName).then(([ hubs, hub ]) => {
    const playerInHubs = _clients.filter(e => e.hubName === hub.hubName)
    const teams = _clients.reduce((acc, cur) => {
        acc[cur.team] = 0
        return acc
    }, {})
    playerInHubs.map(e => teams[e.team]++)
    Object.keys(teams).map(e => teams[e] = hub.clientsPerTeam - teams[e])
    client.socket.emit('Connect_nbr', teams)
}))

const take = (data, clients, client) => findClients(client.id).then(([ _clients, _client ]) => {
    findHubs(_client.hubName).then(([ _hubs, _hub ]) => {
        if (data.object) {
            const key = Object.keys(_client.inventory).find(e => e === data.object)
            if (key && _hub.map[_client.pos.y][_client.pos.x][key] > 0) {
                _hub.map[_client.pos.y][_client.pos.x][key]--
                _client.inventory[key]++
                client.socket.emit('ok')
                return
            }
        }
        client.socket.emit('ko')
    })
})

const set_ = (data, clients, client) => findClients(client.id).then(([ _clients, _client ]) => {
    findHubs(_client.hubName).then(([ _hubs, _hub ]) => {
        if (data.object) {
            const key = Object.keys(_client.inventory).find(e => e === data.object)
            if (key && _client.inventory[key] > 0) {
                _hub.map[_client.pos.y][_client.pos.x][key]++
                _client.inventory[key]--
                client.socket.emit('ok')
                return
            }
        }
        client.socket.emit('ko')
    })
})

const eject = (data, clients, client) => findClients(client.id).then(([ __clients, _client ]) => {
    findHubs(_client.hubName).then(([ _hubs, _hub ]) => {
        const res = __clients.filter(c => c.hubName === _client.hubName && c.id !== _client.id && c.pos.x === _client.pos.x && c.pos.y === _client.pos.y)
        res.forEach(c => {
            switch (_client.orientation) {
                case 1: --c.pos.y; break
                case 2: ++c.pos.x; break
                case 3: ++c.pos.y; break
                case 4: --c.pos.x; break
            }
            c.pos = circularPos(c.pos, _hub.mapWidth, _hub.mapHeight)
            const _c = Object.keys(_clients).find(e => _clients[e].id === c.id)
            _clients[_c].socket.emit('eject', { orientation: (c.orientation + 2) % 4 })
        })
        setClients(__clients, () => client.socket.emit(res.length ? 'ok' : 'ko'), {})
    })
})

const fork = (data, clients, client) => findClients(client.id).then(([ __clients, _client ]) => findHubs(_client.hubName).then(([ _hubs, _hub ]) => {
    //first increasre team player number
    //check max per team
    //second spwan an ia with good parameter to make it wait 600 before he play
}))

//INFO: HUB
const createHub = (data, clients, client, hubs) => {
    if (validateJson(createHubP)(data).errors.length) return
    get('hubs').then(async e => {
        const _hubs = JSON.parse(e)
        if (_hubs.find(_hub => _hub.hubName === data.hubName)) return
        logInfoSocket('Hub created ' + data.name)
        _hubs.push(Object.assign(data, { id: _hubs.length + 1, map: await generateMap(data.mapWidth, data.mapHeight) }))
        set('hubs', JSON.stringify(_hubs)).then(() => {
            logInfoSocket('Job queue created ' + data.hubName)
            hubs[ _hubs.length + 1 ] = { hub: createHubQ(data.hubName, hubEvents), name: data.hubName }
        })
    })
}

const deleteHub = data => {
    if (validateJson(deleteHubP)(data).errors.length) return
    get('hubs').then(e => {
        const hubs = JSON.parse(e)
        const id = data.id
        const _new = hubs.filter(e => e.id !== id)
        set('hubs', JSON.stringify(_new))
    })
    logInfoSocket('Hub deleted ' + data.name)
}

const fns = {
    eject,
    set_,
    take,
    connectnbr,
    inventory,
    look,
    right,
    left,
    forward,
    fork 
}

const hubEvents = async (job, done) => {
    const data = job.data
    const client = _clients[ data.client_id ]
    const clients = JSON.parse(await get('clients'))
    const fronts = Object.keys(_clients).filter(e => _clients[e].front === true)
    const hubs = JSON.parse(await get('hubs'))
    const hubInfo = hubs.find(e => e.name === client.hubName)
    await fns[data.fn](data, clients, client)
    decr(client.id)
    fronts.map(e => _clients[e].socket.emit(`update:${client.hub}`, { hubInfo, clients }))
    done()
}

const userEvents = async (job, done) => {
    const data = job.data
    const client = _clients[ data.client_id ]
    if (data.id === 'start') {          
        client.socket.emit('start')
        done()
        return
    }
    setTimeout(() => {
        createHubJob(client.hub, data, () => logQInfo(`${data.title} hub queued`))
        done()
    }, data.time * 1000)
}

module.exports = { connect, disconnect, connectFront, createHub, deleteHub }