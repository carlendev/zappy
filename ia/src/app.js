const socket = require('socket.io-client')
const argv = require('argv')
const { start } = require('./start')

argv.version('v0.1');
argv.info('Artificial Intelligence for the Zappy project');
const args = argv.option([
    {
        name: 'hub',
        type: 'string',
        description: 'Name of the hub',
        example: "--hub=\"hub1\""
    },
    {
        name: 'name',
        short: 'n',
        type: 'string',
        description: 'Name of the team',
        example: "--name=\"team1\" or -n=\"team1\""
    },
    {
        name: 'host',
        short: 'h',
        type: 'string',
        description: 'Name of the host',
        example: "--host=\"127.0.0.1\" or -h=\"127.0.0.1\""
    },
    {
        name: 'port',
        short: 'p',
        type: 'int',
        description: 'Port number',
        example: "--port=3001 or -p=3001"
    },
]).run()

const port = args.options.port || 3001
const host = args.options.host || 'localhost'

if (!args.options.hub || !args.options.hub.length || !args.options.name || !args.options.name.length) {
    argv.help()
    process.exit(1)
}

const io = socket.connect(`http://${host}:${port}`)

io.on('connect', () => {
    console.log(`connected to http://${host}:${port}`)
    io.emit('join', { hubName: args.options.hub, team: args.options.name })
})

let hasStarted = false

io.on('start', () => {
  hasStarted = true
  start()
})

io.on('forkStart', () => {
  hasStarted = true
  start()
})

module.exports = { io }