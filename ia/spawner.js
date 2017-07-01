const argv = require('argv')
const spawnProcess = require('child_process').spawn

const args = argv.option([
    {
        name: 'hub',
        type: 'string',
        description: 'Name of the hub',
        example: "./app --hub=\"hub1\" --teams=\"ISSOU|BITE|OK\" --players=3"
    },
    {
        name: 'teams',
        type: 'string',
        description: 'Name of the teams',
        example: "./app --hub=\"hub1\"  --teams=\"ISSOU|BITE|OK\" --players=3"
    },
    {
        name: 'players',
        type: 'number',
        description: 'Number of players',
        example: "./app --hub=\"hub1\"  --teams=\"ISSOU|BITE|OK\" --players=3"
    }
]).run()

const pipe = '|'

const wesh = console.log

const exit = (code=0) => process.exit(code)

const msgExit = (msg, code=0) => {
    wesh(msg)
    exit(code)
}

if (args.options.players === undefined || args.options.teams === undefined || args.options.hub === undefined) {
    argv.help()
    exit()
}

const players = args.options.players
const teams = args.options.teams
const hub = args.options.hub

const teamsTab = teams.split(pipe).filter(e => e !== '')

if (!teamsTab.length) return msgExit('Please enter at least 1 team.')

if (players <= 0) return msgExit('Please enter at least one player.')

if (teams === '') return msgExit('Please enter a proper hub name.')

teamsTab.map(e => [ ...Array(players) ].map(f => spawnProcess('node', [ './src/app.js', `--name=${e}`, `--hub=${hub}` ]))).map(e => {
    const p = e[0]
    p.stdout.on('data', data => console.log(`stdout: ${data}`))
    p.stderr.on('data', data => console.log(`stderr: ${data}`))
    p.on('close', code => console.log(`child process exited with code ${code}`))
})