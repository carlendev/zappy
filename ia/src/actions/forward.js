const { io } = require('../app')
const { emit } = require('../emit')

function forward() {
  console.log('Forward')
  emit('Forward')
  emit('Forward')
  emit('Forward')
}

module.exports = { forward }