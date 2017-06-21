const R = require('ramda')
const { set, get } = require('./redisfn')

const mockResponse = (data, code=200) => ({ code, data })

const sendJson = fn => R.compose(fn, mockResponse)

const setRedis = (key, data) => new Promise((s, f) => set(key, data).then(() => s({ status: 'ok' })).catch(() => f({ status: 'ko' })))

const getRedis = key => new Promise((s, f) => get(key).then(data => s({ [ key ]: data })).catch(err => f({ err })))

const saveRedisThenRes = fn => R.composeP(fn, mockResponse, setRedis)

const getRedisThenRes =  fn => R.composeP(fn, mockResponse, getRedis)

module.exports = { sendJson, saveRedisThenRes, getRedisThenRes }