const { io } = require('./app')
const { action, nextAction } = require('./action')
const { look } = require('./actions/look')
const { forward } = require('./actions/forward')

const objectiveQ = []

function start() {
    console.log('starting to play')
    action(forward)
    nextAction()
}

module.exports = { start }