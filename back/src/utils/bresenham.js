const { circularPos } = require('./map')

const bresenham = (width, height, x0, y0, x1, y1) => {
  let arr = []
  let circularX = Math.min(Math.abs(x1 - x0), width - Math.abs(x1 - x0)) !== Math.abs(x1 - x0) ? true : false
  let circularY = Math.min(Math.abs(y1 - y0), height - Math.abs(y1 - y0)) !== Math.abs(y1 - y0) ? true : false
  x0 = circularX ? (x1 - x0 < 0 ? -(width - x0) : width + x0) : x0
  y0 = circularY ? (y1 - y0 < 0 ? -(height - y0) : height + y0) : y0
  let dx = x1 - x0
  let dy = y1 - y0
  let adx = Math.abs(dx)
  let ady = Math.abs(dy)
  let eps = 0
  let sx = dx > 0 ? 1 : -1
  let sy = dy > 0 ? 1 : -1
  if(adx > ady) {
    for(let x = x0, y = y0; sx < 0 ? x >= x1 : x <= x1; x += sx) {
      arr.push(circularPos({ x, y }, width, height))
      if (Math.abs(x1 - x) <= 1 && Math.abs(y1 - y) <= 1)
        return circularPos({ x, y }, width, height)
      eps += ady
      if((eps<<1) >= adx) {
        y += sy
        eps -= adx
      }
    }
  } else {
    for(let x = x0, y = y0; sy < 0 ? y >= y1 : y <= y1; y += sy) {
      arr.push(circularPos({ x, y }, width, height))
      if (Math.abs(x1 - x) <= 1 && Math.abs(y1 - y) <= 1)
        return circularPos({ x, y }, width, height)
      eps += adx
      if((eps<<1) >= ady) {
        x += sx
        eps -= ady
      }
    }
  }
};

module.exports = bresenham