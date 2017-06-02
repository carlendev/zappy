const _redis = require('redis')
const bluebird = require('bluebird')

bluebird.promisifyAll(_redis.RedisClient.prototype)
bluebird.promisifyAll(_redis.Multi.prototype)

const redis = _redis.createClient()

module.exports = redis