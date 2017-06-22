const { logInfoSocket } = require('../../utils/logger')
const { createHubP, deleteHubP, validateJson } = require('../../utils/validator')
const { generateMap } = require('../../utils/map')
const { set, get } = require('../../utils/redisfn')

const createHub = (data, clients) => {
    if (validateJson(createHubP)(data).errors.length) return
    get('hubs').then(async e => {
        const hubs = JSON.parse(e)
        if (hubs.find(hub => hub.hubName === data.hubName)) return
        logInfoSocket('Hub created ' + data.name)
        hubs.push(Object.assign(data, { id: hubs.length + 1, map: await generateMap(data.mapWidth, data.mapHeight) }))
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