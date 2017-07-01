const { io } = require('../app')
const { emit } = require('../emit')

const k = () => console.log('Forward ok')

function forward() {
  console.log('Forward')
  emit('Forward', k)
  emit('Forward', k)
  emit('Forward', k)
  emit('Take', () => console.log('Took bite'), { object: 'bite' })
}

module.exports = { forward }