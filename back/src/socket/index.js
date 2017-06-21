const { logInfoSocket } = require('../utils/logger')
const { io } = require('../app')
const { clientPnw, validateJson } = require('../utils/validator')
const { set, get } = require('../utils/redisfn')

const socket = () => {
    const clients = {}

    io.on('connection', client => {  
        logInfoSocket('Client connected')

        client.on('pnw', data => {
            if (validateJson(clientPnw)(data).errors.length) return
            //TODO: (carlendev) check if team and hub exist
            clients[ client.id ] = { socket: client, id: client.id }
            logInfoSocket('Client connected ' + client.id)
            get('clients').then(e => {
                const add = JSON.parse(e)
                const id = client.id
                add.push(Object.assign(data, { id }))
                set('clients', JSON.stringify(add))
            })
        })

        client.on('disconnect', () => {
            get('clients').then(e => {
                const rm = JSON.parse(e)
                const id = client.id
                const _new = rm.filter(e => e.id !== id)
                set('clients', JSON.stringify(_new)).then(() => delete clients[ client.id ])
                logInfoSocket('Client disconnected ' + client.id)
            })
        })
    })
}

module.exports = socket
