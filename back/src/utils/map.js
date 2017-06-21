const { get } = require('./redisfn')

const initMap = size => {
  const map = []
  
  for (let y = 0; y < size; y++) {
    map[y] = [];
    for (let x = 0; x < size; x++)
      map[y][x] = { dietary: 0, linemate: 0, deraumere: 0, sibur: 0, mendiane: 0, phiras: 0, thystame: 0 }
  }
  return map
}

const randBetween = (min, max) => Math.floor((Math.random() * (max - min + 1)) + min)

const randTile = (size) => ({ x: randBetween(0, size - 1), y: randBetween(0, size - 1)})

const generateMap = async () => {
  const size = +(await get('mapSize'))
  const ressourceRatio = await get('ressourceRatio')
  let map = initMap(size)

  for (let i = Math.floor(size ** 2 * ressourceRatio); i > 0; i--) {
    let tile = randTile(size)
    map[tile.y][tile.x].dietary++
    tile = randTile(size)
    map[tile.y][tile.x][Object.keys(map[0][0])[randBetween(1, 6)]]++
  }
  return JSON.stringify({id: 0, map: map})
}

module.exports = { generateMap }