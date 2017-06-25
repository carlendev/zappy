const { get } = require('./redisfn')

const initMap = (width, height) => {
  const map = []
  for (let y = 0; y < height; ++y) {
    map[y] = []
    for (let x = 0; x < width; ++x)
      map[y][x] = { dietary: 0, linemate: 0, deraumere: 0, sibur: 0, mendiane: 0, phiras: 0, thystame: 0 }
  }
  return map
}

const circularPos = (pos, width, height) => ({ x: (pos.x %= width) < 0 ? width - -pos.x : pos.x, y: (pos.y %= height) < 0 ? height - -pos.y : pos.y })

const randBetween = (min, max) => Math.floor((Math.random() * (max - min + 1)) + min)

const makeRand = size => randBetween(0, size - 1)

const randTile = (width, height) => ({ x: makeRand(width), y: makeRand(height) })

const generateMap = async (width, height) => {
  const ressourceRatio = await get('ressourceRatio')
  const map = initMap(width, height)
  for (let i = Math.floor(width * height * ressourceRatio); i > 0; --i) {
    let tile = randTile(width, height)
    map[tile.y][tile.x].dietary++
    tile = randTile(width, height)
    map[tile.y][tile.x][ Object.keys(map[ 0 ][ 0 ])[ randBetween(1, 6) ] ]++
  }
  return map
}

module.exports = { generateMap, randTile, circularPos }