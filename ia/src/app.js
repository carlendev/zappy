const socket = require('socket.io-client')
const argv = require('argv')

const args = argv.option([
    {
        name: 'hub',
        type: 'string',
        description: 'Name of the hub',
        example: "./app --hub=\"hub1\" --team=\"BITE\" --address=\"http://127.0.0.1:3001\""
    },
    {
        name: 'team',
        type: 'string',
        description: 'Name of the team',
        example: "./app --hub=\"hub1\"  --team=\"ISSOU\" --address=\"http://127.0.0.1:3001\""
    },
    {
        name: 'address',
        type: 'string',
        description: 'Address of the server',
        example: "./app --hub=\"hub1\"  --team=\"ISSOU\" --address=\"http://127.0.0.1:3001\""
    },
]).run()

const io = socket.connect(args.options.address)

io.on('connect', () => {
    io.emit('join', { hubName: args.options.hub, team: args.options.team })
})

const fuckQ = []