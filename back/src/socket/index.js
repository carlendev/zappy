const { logInfoSocket } = require('../utils/logger')
const { io } = require('../app')

const socket = () => {
    io.on('connection', client => {  
        logInfoSocket('Client connected')

        client.on('join', data => {
            //console.log(data)
        })
    })
}

module.exports = socket
