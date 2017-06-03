const { logInfo } = require('./logger')
//app middleware
const jsonSchemaError = (err, req, res, next) => {
    if (err.name === 'JsonSchemaValidation') {
        res.status(400)
        if (req.xhr || req.get('Content-Type') === 'application/json') res.json({
           statusText: 'Bad Request',
           jsonSchemaValidation: true,
           validations: err.validations
        })  
    } else next(err)
}

const jsonSyntaxError = (err, req, res, next) => {
    if (err instanceof SyntaxError) {
        res.status(400)
        res.json({
            code: 400,
            statusText: 'Invalid Json'
        })
    }
    else next(err)
}

//router middleware
const log = (req, res, next) => {
    logInfo(`[${req.method}] ${req.originalUrl} ${req.ip}`)
    next()
}

module.exports = { jsonSchemaError, jsonSyntaxError, log }