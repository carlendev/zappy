const { logInfoSocket, logQInfo } = require('../../utils/logger')
const { set, get } = require('../../utils/redisfn')
const { createHubJob } = require('../../queue/index')

const getFrontId = clients => Object.keys(clients).find(e => clients[e].front === true)

const getClientById = (clients, id) => clients.find(c => c.id === id)

const forgeClientInfo = (client, front_id) => ({ client_id: client.id, front_id, hub: client.hub })

const forgeInfoString = (action, time) => ({ id: action, title: action, fn: action.toLowerCase(), time })

const forge = (e, clientsLocal, id) => {
  const clients = JSON.parse(e)
  const front_id = getFrontId(clientsLocal)
  const client = getClientById(clients, id)
  return (action, time) => Object.assign(forgeClientInfo(client, front_id), forgeInfoString(action, time))
}

const Forward = (data, clientsLocal, client, hubs) => 
  get('clients').then(e => createHubJob(client.id, forge(e, clientsLocal, client.id)('Forward', 1), () => logQInfo('Forward queued')))

const Right = (data, clientsLocal, client, hubs) =>
  get('clients').then(e => createHubJob(client.id, forge(e, clientsLocal, client.id)('Right', 1), () => logQInfo('Right queued')))

const Left = (data, clientsLocal, client, hubs) =>
  get('clients').then(e => createHubJob(client.id, forge(e, clientsLocal, client.id)('Left', 1), () => logQInfo('Left queued')))

const Look = (data, clientsLocal, client, hubs) =>
  get('clients').then(e => createHubJob(client.id, forge(e, clientsLocal, client.id)('Look', 1), () => logQInfo('Look queued')))

module.exports = { Forward, Right, Left, Look }