const { logInfoSocket } = require('../utils/logger')
const { io } = require('../app')
const { clientPnw, deleteHub, validateJson } = require('../utils/validator')
const { set, get } = require('../utils/redisfn')

const socket = () => {
    const clients = {}

    io.on('connection', client => {  
        logInfoSocket('Client connected')

        client.on('pnw', data => {
            if (validateJson(clientPnw)(data).errors.length) return
            //TODO: (carlendev) check if team and hub exist
            clients[ client.id ] = { socket: client, id: client.id, front: false }
            logInfoSocket('Client connected ' + client.id)
            get('clients').then(e => {
                const add = JSON.parse(e)
                const id = client.id
                add.push(Object.assign(data, { id }))
                set('clients', JSON.stringify(add))
            })
        })

        client.on('disconnect', () => {
            if (clients[ client.id ].front) {
                delete clients[ client.id ]
                return
            }
            get('clients').then(e => {
                const rm = JSON.parse(e)
                const id = client.id
                const _new = rm.filter(e => e.id !== id)
                set('clients', JSON.stringify(_new)).then(() => delete clients[ client.id ])
                logInfoSocket('Client disconnected ' + client.id)
            })
        })

        client.on('connectFront', () => {
            clients[ client.id ] = { socket: client, id: client.id, front: true }
            logInfoSocket('Front connected')
        })

        client.on('createHub', data => {
            if (data.name === undefined || data.name === null) return
            logInfoSocket('Hub created ' + data.name)
            get('hubs').then(e => {
                const hubs = JSON.parse(e)
                hubs.push(Object.assign(data, { id: hubs.length + 1 }))
                set('hubs', JSON.stringify(hubs))
            })            
        })

        //TODO: (carlendev) delete all the client in this hub
        client.on('deleteHub', data => {
            if (validateJson(deleteHub)(data).errors.length) return
            get('hubs').then(e => {
                const hubs = JSON.parse(e)
                const id = data.id
                const _new = hubs.filter(e => e.id !== id)
                set('hubs', JSON.stringify(_new))
            })
            logInfoSocket('Hub deleted ' + data.name)
        })

    })
}

module.exports = socket
