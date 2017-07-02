const { io } = require('../app')
const { emit } = require('../emit')
const { action, nextAction } = require('../action')
const { getLvl, setLvl, getInventory, setInventory } = require('../player')

const requirements = [
    { linemate: 1, deraumere: 0, sibur: 0, mendiane: 0, phiras: 0, thystame: 0 },
    { linemate: 1, deraumere: 1, sibur: 1, mendiane: 0, phiras: 0, thystame: 0 },
    { linemate: 2, deraumere: 0, sibur: 1, mendiane: 0, phiras: 2, thystame: 0 },
    { linemate: 1, deraumere: 1, sibur: 2, mendiane: 0, phiras: 1, thystame: 0 },
    { linemate: 1, deraumere: 2, sibur: 1, mendiane: 3, phiras: 0, thystame: 0 },
    { linemate: 1, deraumere: 2, sibur: 3, mendiane: 0, phiras: 1, thystame: 0 },
    { linemate: 2, deraumere: 2, sibur: 2, mendiane: 2, phiras: 2, thystame: 1 }
]

function move(path) {
    for (let i = 0; i < path.forward; ++i)
        emit('Forward')
    emit(path.dir < 0 ? 'Left' : 'Right')
    for (let i = 0; i < Math.abs(path.dir); ++i)
        emit('Forward')
}

function tileRelative(target) {
    let pos = 0, line = 0, len = 1;
    while (pos < target) {
        len += 2
        pos += len
        ++line
    }
    let middle = pos - Math.floor(len / 2)
    return target < middle ? { forward: line, dir: -(middle - target) } : { forward: line, dir: target - middle }
}

const tileWithMostFood = data => data.indexOf([ ...data ].sort((a, b) => b.food - a.food)[0])

const tileWithMostStones = (data, inventory, requirement) => data.indexOf([ ...data ].sort((a, b) => {
    const teub = Object.keys(requirement).reduce((acc, cur) => a[ cur ] - (requirement[ cur ] - inventory[ cur ]) + acc, 0)
    const bite = Object.keys(requirement).reduce((acc, cur) => b[ cur ] - (requirement[ cur ] - inventory[ cur ]) + acc, 0)
    return Math.min(teub, bite) === bite ? -1 : 1
})[0])

function look() {
    console.log('Look')
    emit('Look', (name, data) => {
        if (name === 'ko') return
        const inventory = getInventory()
        const requirement = requirements[ getLvl() - 1 ]
        console.log('Tile with the most food: ', tileWithMostFood(data))
        if (inventory.food <= 3) return move(tileRelative(tileWithMostFood(data)))
        console.log('Tile with the most stones: ', tileWithMostStones(data, inventory, requirement))
        const teub = tileWithMostStones(data, inventory, requirement)
        move(tileRelative(teub))
        Object.keys(requirement).forEach(e => {
            for (let i = inventory[ e ]; data[teub][ e ] > i && requirement[ e ] - i > 0; ++i) {
                emit('Take', name => { console.log('Take returned ', name) }, { object: e })
            }
        })
        action(look)
        nextAction()
    })
}

module.exports = { look }