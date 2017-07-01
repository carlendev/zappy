const { io } = require('./app')
const { action, nextAction } = require('./action')
const { look } = require('./actions/look')

const objectiveQ = []

function start() {
    console.log('starting to play')
    action(look)
    nextAction()
}

module.exports = { start }