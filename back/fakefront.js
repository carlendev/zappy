const socket = require('socket.io-client')
const prettyjson = require('prettyjson')
const io = socket.connect('http://127.0.0.1:3001')
   
const wesh = console.log

const exit = (code=0) => process.exit(code)

io.on('connect', () => {
    io.emit('connectFront')
    wesh('I\' am connected')
    io.emit('createHub', {
      hubName: 'hub1',
        mapWidth: 8,
        mapHeight: 8,
        teams: [
            'ISSOU',
            'BITE'
        ],
        clientsPerTeam: 1
    })
})

io.on('dead', () => {
    wesh('I\' dead')
    exit()
})

io.on('update:hub1', data => {
    wesh('I\' m updated')
    wesh(prettyjson.render(data))
})


io.on('disconnect', () => {
    wesh('I\'m out')
    exit()
})