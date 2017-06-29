class Interval {
  constructor(callback, time, freq) {
    this.fn = callback
    this.time = time
    this.freq = freq
    this.start = Date.now()
    this.interval = setInterval(this.fn, this.time * 1000 / this.freq)
  }

  frequency(freq) {
    this.freq = freq
    const remaining = this.time * 1000 - (Date.now() - this.start)
    clearInterval(this.interval)
    this.interval = setInterval(this.fn, remaining / this.freq)
  }
}

module.exports = Interval