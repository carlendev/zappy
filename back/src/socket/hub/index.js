const { logInfoSocket } = require('../../utils/logger')
const { clientPnw, deleteHubP, validateJson } = require('../../utils/validator')
const { generateMap } = require('../../utils/map')
const { set, get } = require('../../utils/redisfn')
const  { createHubQ, createHubJob } = require('../../queue/index')

const createHub = (data, clients) => {
    if (data.name === undefined || data.name === null) return
    logInfoSocket('Hub created ' + data.name)
    get('hubs').then(async e => {
        const hubs = JSON.parse(e)
        hubs.push(Object.assign(data, { id: hubs.length + 1, map: await generateMap() }))
        set('hubs', JSON.stringify(hubs))
    })
}

const _createHub = (data, clients, client, hubs) => {
    if (data.name === undefined || data.name === null) return
    logInfoSocket('_Hub created ' + data.name)
    get('hubs').then(async e => {
        const _hubs = JSON.parse(e)
        _hubs.push(Object.assign(data, { id: _hubs.length + 1, map: await generateMap() }))
        set('hubs', JSON.stringify(_hubs)).then(() => {
            logInfoSocket('Job queue created ' + data.name)
            hubs[ _hubs.length + 1 ] = { hub: createHubQ(data.name, hubEvents), name: data.name }
        })
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

const hubEvents = (job, done) => {
    const data = job.data
    console.log(data)
    done()
}

module.exports = { createHub, deleteHub, _createHub }