const { io } = require('./app')
const { look } = require('./actions/look')
const { forward } = require('./actions/forward')

const actionQ = []
const objectiveQ = []

const actions = {
    look,
    forward
}

function start() {
    actionQ.push(look)
}