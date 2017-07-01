const { io } = require('../app')
const { emit } = require('../emit')

function look() {
  console.log('Look')
  emit('Look')
}

module.exports = { look }