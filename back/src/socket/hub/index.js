const { logInfoSocket } = require('../../utils/logger')
const { clientPnw, deleteHubP, validateJson } = require('../../utils/validator')
const { generateMap } = require('../../utils/map')
const { set, get } = require('../../utils/redisfn')

const createHub = (data, clients) => {
    if (data.name === undefined || data.name === null) return
    logInfoSocket('Hub created ' + data.name)
    get('hubs').then(async e => {
        const hubs = JSON.parse(e)
        hubs.push(Object.assign(data, { id: hubs.length + 1, map: await generateMap() }))
        set('hubs', JSON.stringify(hubs))
    })     
}

const deleteHub = data => {
    if (validateJson(deleteHubP)(data).errors.length) return
    get('hubs').then(e => {
        const hubs = JSON.parse(e)
        const id = data.id
        const _new = hubs.filter(e => e.id !== id)
        set('hubs', JSON.stringify(_new))
    })
    logInfoSocket('Hub deleted ' + data.name)
}

module.exports = { createHub, deleteHub }