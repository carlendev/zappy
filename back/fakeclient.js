const socket = require('socket.io-client')
const argv = require('argv')
const io = socket.connect('http://127.0.0.1:3001')

const wesh = console.log

const exit = (code=0) => process.exit(code)

const args = argv.option([
    {
        name: 'hub',
        type: 'string',
        description: 'Name of the hub',
        example: "./app --hub='hub1' --team='ISSOU'"
    },
    {
        name: 'team',
        type: 'string',
        description: 'Name of the team',
        example: "./app --hub='hub1' --team='ISSOU'"
    }
]).run()

let asStart = false

if (args.options.hub === undefined || args.options.team === undefined) {
    argv.help()
    exit()
}

io.on('connect', () => {
    io.emit('join', { hubName: args.options.hub, team: args.options.team })
    wesh('I\' am connected')
})

io.on('ok', () => {
    wesh('ok')
})

io.on('ko', () => {
    wesh('ko')
})

io.on('look', look =>{ 
    wesh('Look: ', look)
})

io.on('inventory', inventory => {
    wesh('Inventory: ', inventory)
})

io.on('eject', orientation => {
    wesh('Eject: ', orientation)
})

io.on('dead', () => {
    wesh('I\' dead')
    exit()
})

io.on('Connect_nbr', data => {
    wesh(data)
})

io.on('Elevation underway', () => {
    wesh('Elevation underway')
})

io.on('Current level', data => {
    wesh('Current level: ' + data.lvl)
})

io.on('message', data => {
    wesh('received "' + data.text + '" from ' + data.direction)
})

io.on('start', () => {
    wesh('Start play')
    if (asStart) return
    asStart = true
    //io.emit('Fork')
    io.emit('Forward')
    io.emit('Right')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Left')
    io.emit('Left')
    io.emit('Forward')
    io.emit('Right')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Left')
    io.emit('Forward')
    io.emit('Right')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Left')
    //io.emit('Incantation')
    //setTimeout(() => io.emit('sst', { hub: args.options.hub, freq: 100 }), 500)
})


io.on('forkStart', () => {
    wesh('Start play fork')
    if (asStart) return
    asStart = true
    io.emit('Right')
    io.emit('Forward')
    io.emit('Right')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Left')
    io.emit('Right')
    io.emit('Forward')
    io.emit('Right')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Left')
    io.emit('Forward')
    io.emit('Right')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Forward')
    io.emit('Left')
    io.emit('Right')
})

io.on('disconnect', () => {
    wesh('I\'m out')
    exit()
})