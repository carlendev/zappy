const redis = require('./redis')

const get = key => redis.getAsync(key)

const set = (key, value) => redis.setAsync(key, value)

module.exports = { get, set }