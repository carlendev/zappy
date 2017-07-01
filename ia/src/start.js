const { io } = require('./app')
const { look } = require('./actions/look')
const { forward } = require('./actions/forward')

const actionQ = []
const objectiveQ = []

function nextAction() {
    const action = actionQ.shift()
    action && action()
}

function start() {
    console.log('starting to play')
    actionQ.push(forward)
    nextAction()
}

module.exports = { start }