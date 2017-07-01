const { io } = require('../app')
const { emit } = require('../emit')
const { action } = require('../action')
const { getInventory, setInventory } = require('../actions/inventory')

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

function look() {
    console.log('Look')
    emit('Look', data => {
        /*
        if (getInventory().food <= 3 && data.sort((a, b) => b.food - a.food)[0].food > 0) {
            return move(tileRelative())
        }
        data.map((e, i) => i)
        move(tileRelative(8))
        */
    })
}

module.exports = { look }