const redis = require('./redis')

const get = key => redis.getAsync(key)

const set = (key, value) => redis.setAsync(key, value)

const send = cmd => redis.send_commandAsync(cmd)

module.exports = { get, set, send }