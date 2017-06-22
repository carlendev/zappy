const socket = require('socket.io-client')
const io = socket.connect('http://127.0.0.1:3001')

const wesh = console.log

const exit = (code=0) => process.exit(code)

io.on('connect', () => {
    io.emit('connectFront')
    wesh('I\' am connected')
})

setTimeout(() => io.emit('_createHub', { name: 'hub1' }), 1000)

//setTimeout(() => io.emit('deleteHub', { id: 1 }), 2000)

io.on('dead', () => {
    wesh('I\' dead')
    exit()
})

io.on('disconnect', () => {
    wesh('I\'m out')
    exit()
})