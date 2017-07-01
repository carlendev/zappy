const { io } = require('./app')

const emitQ = []
const responses = {
    'Forward': 'ok',
    'Left': 'ok',
    'Right': 'ok',
    'Look': 'Look',
    'Inventory': 'Inventory',
    'Brodcast': 'ok',
    'Connect_nbr': 'Connect_nbr',
    'Fork': 'ok',
    'Eject': 'ok',
    'Take': 'ok',
    'Set': 'ok',
    'Incantation': 'ok'
}

function nextEmit() {
    emitQ && emitQ.length && io.emit(emitQ[0].name, emitQ[0].data)
}

function emit(name, callback, data) {
    emitQ.push({ name, callback, data })
    if ( emitQ.length === 1 ) return nextEmit()
}

function receive(name, data) {
    if (emitQ && emitQ.length > 0) {
        const queued = emitQ[0]
        const responseKey = Object.keys(responses).find(e => e === queued.name)
        if (!responseKey === undefined)
            return console.error(`${queued.name} is not a response`)
        if (name !== responses[ responseKey ] && name !== 'ok')
            return console.error(`${name} is not a valid response to ${queued.name}`)
        queued.callback && queued.callback(data)
        emitQ.shift()
        nextEmit()
    } else console.warn(`Received ${name} but no emit was queued`)
}

io.on('dead', () => process.exit(0))
io.on('ok', () => receive('ok'))
io.on('ko', () => receive('ko'))
io.on('Look', data => receive('Look', data))
io.on('Inventory', data => receive('Inventory', data))
io.on('Connect_nbr', data => receive('Connect_nbr', data))
io.on('Current level', data => receive('Current level', data))

io.on('Elevation underway', () => {
    console.log(`Elevation underway`)
})

io.on('message', data => {
    console.log(`Brodcast "${data.text}" received from ${data.direction}`)
})

module.exports = { emit }