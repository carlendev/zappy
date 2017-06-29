class Timer {
  constructor(callback, time, freq) {
    this.fn = callback
    this.time = time
    this.freq = freq
    this.start = Date.now()
    this.timeout = setTimeout(this.fn, this.time * 1000 / this.freq)
  }

  frequency(freq) {
    this.freq = freq
    const remaining = this.time * 1000 - (Date.now() - this.start)
    clearTimeout(this.timeout)
    this.timeout = setTimeout(this.fn, remaining / this.freq)
  }
}

module.exports = Timer