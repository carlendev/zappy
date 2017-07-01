const { logInfoSocket, logQInfo, logQError, logInfo } = require('../../utils/logger')
const { clientPnw, validateJson, createHubP, deleteHubP } = require('../../utils/validator')
const { set, get, decr, findClients, findClientsInHub, findHubs, findInfos, setClients, setHubs } = require('../../utils/redisfn')
const { createHubQ, createHubJob } = require('../../queue/index')
const { randTile, circularPos, generateMap } = require('../../utils/map')
const spawnProcess = require('child_process').spawn
const bresenham = require('../../utils/bresenham')
const Interval = require('../../utils/interval')
const Timer = require('../../utils/timer')
const { forgeInfoString } = require('../action/index')

let _clients = {}
let _timeouts = []
let _intervals = []
let _io = null
let asStart = {}
const ia = './../ia/src/app.js'
const serverQ = 'fuckQ'

const emitDead = (client, msg) => {
    logInfoSocket(msg)
    client.emit('dead')
}

const registerClient = (clients, client, data, nbTeam, nbPlayerMax, playerPos, io) => {
    clients[ client.id ] = { socket: client, id: client.id, front: false, hub: data.hubName, team: data.team }
    _clients = clients
    _io = io
    const id = client.id
    const action = 'userconnect'
    const time = 0
    const front_id = Object.keys(clients).find(e => clients[e].front === true)
    createHubJob(serverQ, Object.assign(data, { client_id: client.id, front_id, hub: client.hub, title: action, fn: action, time }, { id, pos: playerPos, orientation: 1, lvl: 2, nbActions: 0,
        inventory: { food: 10, linemate: 0, deraumere: 0, sibur: 0, mendiane: 0, phiras: 0, thystame: 0 } }),
        () => logQInfo('Connect queued'))
}

const begin = (data, clients, client, io) => findClients('').then(([ __clients ]) => findHubs(data.hubName).then(([ hubs, hub ]) => {
    if (asStart[ data.hubName ]) return io.emit('err', { msg: 'Party as already start' })
    const nbPlayerMax = hub.clientsPerTeam
    const nbTeam = hub.teams.length
    const playerInHub = __clients.filter(e => e.hubName === data.hubName)
    if (playerInHub.length !== nbPlayerMax * nbTeam) return io.emit('err', { msg: 'Not enought players' })
    asStart[ data.hubName ] = true
    io.emit('start')
    const front_id = Object.keys(clients).find(e => clients[e].front === true)
    if (_clients[ client.id ].front) return
    playerInHub.map(e => createHubJob(e.id, { hub: e.hub, id: 'start', title: 'Start game', client_id: e.id, front_id },
                () => logQInfo('Start game')))
    logInfoSocket('Start hub party')
}))


const connectFront = (_, clients, client) => {
    clients[ client.id ] = { socket: client, id: client.id, front: true }
    _clients = clients
    logInfoSocket('Front connected')
}

const userconnect = (data, clients, client) => findClients('').then(([ add ]) => {
    const id = client.id
    add.push(data)
    set('clients', JSON.stringify(add)).then(e => {
        set(client.id, 0).then(() => {
            createHubQ(id, userEvents)
            logInfoSocket('Client connected ' + client.id)
        })
    })
})

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
        const playerInTeam = playerInHub.filter(e => e.team === data.team)
        if (playerInTeam === undefined || playerInTeam === null) return registerClient(clients, client, data, nbTeam, nbPlayerMax, playerPos, io)
        if (playerInTeam.length === currentHub.nbPlayerMax) return emitDead(client, `Connection rejected, ${data.hubName} to much player in this team`)
        return registerClient(clients, client, data, nbTeam, nbPlayerMax, playerPos, io)
    })
}

const disconnect = (data, clients, client) => {
    if (clients === undefined || clients[ client.id ] === undefined) return
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
            case 2: ++_client.pos.x; break
            case 3: ++_client.pos.y; break
            case 4: --_client.pos.x; break
        }
        _client.pos = circularPos(_client.pos, _hub.mapWidth, _hub.mapHeight)
    setClients(_clients, _client => {logInfoSocket('New pos is: ' + JSON.stringify(_client.pos)); client.socket.emit('ok')}, _client)
}))

const left = (data, clients, client) => findClients(client.id).then(([ _clients, _client ]) => {
    if (--_client.orientation < 1) _client.orientation = 4
    setClients(_clients, _client => {logInfoSocket('New orientation is: ' + _client.orientation); client.socket.emit('ok')}, _client)
})

const right = (data, clients, client) => findClients(client.id).then(([ _clients, _client ]) => {
    if (++_client.orientation > 4) _client.orientation = 1
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
            client.socket.emit('Look', res.map(p =>
                Object.assign({}, { players: _clients.filter(e => p.y === e.pos.y && p.x === e.pos.x).length }, _hub.map[p.y][p.x]))))
    })
})

const inventory = (data, clients, client) => findClients(client.id).then(([ _clients, _client ]) => { client.socket.emit('Inventory', _client.inventory) })

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
                setHubs(_hubs, () => client.socket.emit('ok'), _hub)
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
                setHubs(_hubs, () => client.socket.emit('ok'), _hub)
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

const fork = (data, clients, client) => findHubs(client.hub).then(async ([ _hubs ]) => {
    const _hub = _hubs.find(e => e.hubName === client.hub)
    ++_hub.clientsPerTeam
    //TODO: set this to subject post time
    data.time = 1
    data.id = 'forkSpawn'
    data.title = 'Spawn'
    data.fn  = 'spawn'
    await setHubs(_hubs, _hub => logInfoSocket(_hub.hubName + '\'s number of players increased ' + _hub.freq), _hub)
    createHubJob(client.id, data, () => logInfoSocket('Swpan queued'))
    client.socket.emit('ok')
})

const spawn = (data, clients, client) => findHubs(client.hub).then(async ([ _hubs ]) => {
    const _hub = _hubs.find(e => e.hubName === client.hub)
    const process = spawnProcess('node', [ ia, `--name=${client.team}`, `--hub=${_hub.hubName}` ])
    setTimeout(() => _io.emit('forkStart'), 500)
})

const forkstart = (data, clients, client) => {
    logInfoSocket('Fork start ' + client.id)
}   

const brodcast = (data, clients, client) => findClients(client.id).then(([ __clients, _client ]) => {
    findHubs(_client.hubName).then(([ _hubs, _hub ]) => {
        const res = __clients.filter(c => c.hubName === _client.hubName)
        res.forEach(c => {

            const getDir = (pos, tile, xForward, yForward, xLeft, yLeft) => {
                const directions = []

                directions.push(circularPos({ x: pos.x + xForward, y: pos.y + yForward }, _hub.mapWidth, _hub.mapHeight))
                directions.push(circularPos({ x: pos.x + xForward + xLeft, y: pos.y + yForward + yLeft }, _hub.mapWidth, _hub.mapHeight))
                directions.push(circularPos({ x: pos.x + xLeft, y: pos.y + yLeft }, _hub.mapWidth, _hub.mapHeight))
                directions.push(circularPos({ x: pos.x + -xForward + xLeft, y: pos.y + -yForward + yLeft }, _hub.mapWidth, _hub.mapHeight))
                directions.push(circularPos({ x: pos.x + -xForward, y: pos.y + -yForward }, _hub.mapWidth, _hub.mapHeight))
                directions.push(circularPos({ x: pos.x + -xForward + -xLeft, y: pos.y + -yForward + -yLeft }, _hub.mapWidth, _hub.mapHeight))
                directions.push(circularPos({ x: pos.x + -xLeft, y: pos.y + -yLeft }, _hub.mapWidth, _hub.mapHeight))
                directions.push(circularPos({ x: pos.x + xForward + -xLeft, y: pos.y + yForward + -yLeft }, _hub.mapWidth, _hub.mapHeight))
                return  directions.findIndex(e => e.x === tile.x && e.y === tile.y)
            }

            if (c.id === _client.id) {
                client.socket.emit('message', { text: data.text, direction: 0 })
                return
            }

            const tile = bresenham(_hub.mapWidth, _hub.mapHeight, _client.pos.x, _client.pos.y, c.pos.x, c.pos.y)
            let dir = -1
            switch (_client.orientation) {
                case 1: dir = getDir(c.pos, tile, 0, -1, -1, 0); break
                case 2: dir = getDir(c.pos, tile, 1, 0, 0, -1); break
                case 3: dir = getDir(c.pos, tile, 0, 1, 1, 0); break
                case 4: dir = getDir(c.pos, tile, -1, 0, 0, 1); break
            }
            const _c = Object.keys(_clients).find(e => _clients[e].id === c.id)
            if (dir !== -1) _clients[_c].socket.emit('message', { text: data.text, direction: dir + 1 })
        })
        client.socket.emit('ok')
    })
})

const requirements = [
    { players: 1, linemate: 1, deraumere: 0, sibur: 0, mendiane: 0, phiras: 0, thystame: 0 },
    { players: 2, linemate: 1, deraumere: 1, sibur: 1, mendiane: 0, phiras: 0, thystame: 0 },
    { players: 2, linemate: 2, deraumere: 0, sibur: 1, mendiane: 0, phiras: 2, thystame: 0 },
    { players: 4, linemate: 1, deraumere: 1, sibur: 2, mendiane: 0, phiras: 1, thystame: 0 },
    { players: 4, linemate: 1, deraumere: 2, sibur: 1, mendiane: 3, phiras: 0, thystame: 0 },
    { players: 6, linemate: 1, deraumere: 2, sibur: 3, mendiane: 0, phiras: 1, thystame: 0 },
    { players: 6, linemate: 2, deraumere: 2, sibur: 2, mendiane: 2, phiras: 2, thystame: 1 }
]

const incantationFilter = (__clients, _client) => __clients.filter(c => c.hubName === _client.hubName && c.id !== _client.id && c.pos.x === _client.pos.x
                                                && c.pos.y === _client.pos.y && c.lvl === _client.lvl)

const incantationValidator = (res, _client, _hub) => {
    const requirement = requirements[_client.lvl - 1]
    return Object.keys(requirement).every(e => (e === 'players') ? res.length >= requirement.players :
        _hub.map[_client.pos.y][_client.pos.x][e] >= requirement[e])
}

const incantation = (data, clients, client) => findClients(client.id).then(([ __clients, _client ]) => {
    const res = incantationFilter(__clients, _client)
    findHubs(_client.hubName).then(([ _hubs, _hub ]) => {
        if (incantationValidator(res, _client, _hub) === true) {
            res.forEach(c => _clients[ Object.keys(_clients).find(e => _clients[e].id === c.id) ].socket.emit('Elevation underway'))
            createHubJob(client.id, Object.assign(data, forgeInfoString('Elevation', 15)), () => logQInfo('Elevation queued'))
            client.socket.emit('Elevation underway')
        } else client.socket.emit('ko')
    })
})

const elevation = (data, clients, client) => findClients(client.id).then(([ __clients, _client ]) => {
    const res = incantationFilter(__clients, _client)
    findHubs(_client.hubName).then(([ _hubs, _hub ]) => {
        if (incantationValidator(res, _client, _hub) === true) {
            ++_client.lvl
            res.forEach(c => _clients[ Object.keys(_clients).find(e => _clients[e].id === c.id) ].socket.emit('Current level', { lvl: ++c.lvl }))
            const requirement = requirements[_client.lvl - 1]
            Object.keys(requirement).forEach(e => _hub.map[_client.pos.y][_client.pos.x][e] && (_hub.map[_client.pos.y][_client.pos.x][e] -= requirement[e]))
            setHubs(_hubs, () => {}, _hub).then(() => setClients(__clients, () => client.socket.emit('Current level', _client.lvl), {}))
        } else client.socket.emit('ko')
    })
})

const generateIA = ({ hubName, teams, clientsPerTeam }) => teams.map(e => [ ...Array(clientsPerTeam) ].reduce((acc, cur) => {
        acc.push({ team: e, hub: hubName })
        return acc
    }, [])).map(e => e.map(f => {
        const p = spawnProcess('node', [ ia, `--name=${f.team}`, `--hub=${f.hub}` ])
        p.stdout.on('data', data => console.log(`stdout: ${data}`))
        p.stderr.on('data', data => console.log(`stderr: ${data}`))
        p.on('close', code => console.log(`child process exited with code ${code}`))
    }))

//INFO: HUB
const createHub = (data, clients, client, hubs) => {
    if (validateJson(createHubP)(data).errors.length) return
    get('hubs').then(async e => {
        const _hubs = JSON.parse(e)
        if (_hubs.find(_hub => _hub.hubName === data.hubName)) return
        logInfoSocket('Hub created ' + data.hubName)
        _hubs.push(Object.assign(data, { id: _hubs.length + 1, map: await generateMap(data.mapWidth, data.mapHeight) }))
        set('hubs', JSON.stringify(_hubs)).then(() => {
            logInfoSocket('Job queue created ' + data.hubName)
            hubs[ _hubs.length + 1 ] = { hub: createHubQ(data.hubName, hubEvents), name: data.hubName }
            generateIA(data)
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

const eat = (data, clients, client) => findClients(client.id).then(([ __clients, _client ]) => {
    --_client.inventory.food
    if (_client.inventory.food < 0) {
        _timeouts.filter(e => e.id === client.id).map(({ t }) => t.clear())
        _intervals.filter(e => e.id === client.id).map(({ i }) => i.clear())
        _timeouts = _timeouts.filter(e => e.id !== client.id)
        _intervals = _intervals.filter(e => e.id !== client.id)
        const _new = __clients.filter(e => e.id !== client.id)
        setClients(_new, client => {
            client.socket.emit('dead')
            delete _clients[ client.id ]
            logInfoSocket('Client disconnected ' + client.id)
        }, client)
        logQInfo(`${client.id} will die of hunger.`)
    } else {
        logQInfo(`${client.id} ate and has ${_client.inventory.food} food left.`)
        setClients(__clients, () => {}, {})
    }
})

const sst = data => findHubs(data.hub).then(([ _hubs, _hub ]) => {
    if (!_hub || !data.freq) return
    _hub.freq = data.freq
    _timeouts.filter(e => e.hub === data.hub).forEach(timeout => timeout.t.frequency(data.freq))
    _intervals.filter(e => e.hub === data.hub).forEach(interval => interval.i.frequency(data.freq))
    setHubs(_hubs, _hub => logInfo(_hub.hubName + '\'s frequency was updated to ' + _hub.freq), _hub)
})

const fns = {
    eat,
    eject,
    set_,
    take,
    connectnbr,
    inventory,
    look,
    right,
    left,
    forward,
    fork,
    incantation,
    elevation,
    spawn,
    forkstart
}

const fuckfns = { userconnect }

const setValue = (client, key) => {
    if (key === 'eat') client[key] = true
    else client['eat'] = false
    if (key === 'fork')  client[key] = true
    else client['fork'] = false
    if (key === 'incantation') client[key] = true
    else client['incantation'] = false
    if (key === 'take') client[key] = true
    else client['take'] = false
}

const hubEvents = async (job, done) => {
    const data = job.data
    const client = _clients[ data.client_id ]
    const clients = JSON.parse(await get('clients'))
    const _client = clients.find(e => e.id === data.client_id)
    const fronts = Object.keys(_clients).filter(e => _clients[e].front === true)
    const hubs = JSON.parse(await get('hubs'))
    const hubInfo = hubs.find(e => e.name === client.hubName)
    switch (data.fn) {
    case 'take': setValue(_client, 'take'); break
    case 'eat': setValue(_client, 'eat'); break
    case 'fork': setValue(_client, 'fork'); break
    case 'incantation': setValue(_client, 'incantation'); break
    }
    await fns[data.fn](data, clients, client)
    if (data.fn !== 'eat') {
        decr(client.id)
        fronts.map(e => _clients[e].socket.emit(`update:${client.hub}`, { hubInfo, clients }))
    }
    done()
}

const fuckEvents = async (job, done) => {
    const data = job.data
    const client = _clients[ data.client_id ]
    const clients = JSON.parse(await get('clients'))
    await fuckfns[data.fn](data, clients, client)
    done()
}

const userEvents = async (job, done) => {
    const data = job.data
    const client = _clients[ data.client_id ]
    const [ _hubs, _hub ] = await findHubs(client.hub)
    if (data.id === 'start' || data.id === 'forkStart') {
        data.id !== 'forkStart' && client.socket.emit('start')
        _intervals.push({ id: client.id, hub: client.hub,
            i: new Interval(() => createHubJob(client.hub, { client_id: data.client_id, title: 'eat', fn: 'eat' }, () => logQInfo('eat hub queued')),
            126,
            _hub.freq) })
        done()
        return
    }
    const t = new Timer(() => {
        createHubJob(client.hub, data, () => logQInfo(`${data.title} hub queued`))
        _timeouts.splice(_timeouts.findIndex(e => e.t === t), 1)
        done()
    }, data.time, _hub.freq)
    _timeouts.push({ id: client.id, hub: client.hub, t })
}

module.exports = { connect, disconnect, connectFront, createHub, deleteHub, sst, begin, fuckEvents }