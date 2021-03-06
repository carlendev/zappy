const winston = require('winston')

winston.add(winston.transports.File, { filename: process.env.LOGS_FILE || 'zappy.logs' })

const logInfo = msg => winston.log('info', msg)

const logError = msg => winston.log('error', msg)

const logInfoSocket = msg => logInfo(`[SOCKET] ${msg}`)

const logQInfo = msg => logInfo(`[Q] ${msg}`)

const logQError = msg => logError(`[Q] ${msg}`)

module.exports = { logInfo, logError, logInfoSocket, logQInfo, logQError }