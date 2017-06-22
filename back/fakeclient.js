const socket = require('socket.io-client')
const io = socket.connect('http://127.0.0.1:3001')

const wesh = console.log

const exit = (code=0) => process.exit(code)

io.on('connect', () => {
    io.emit('join', { hubName: 'hub1', team: 'BITE' })
    wesh('I\' am connected')
})

io.on('dead', () => {
    wesh('I\' dead')
    exit()
})

io.on('play', () => {
    wesh('Start play')
})


io.on('disconnect', () => {
    wesh('I\'m out')
    exit()
})