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

const moveForward = (data, clientsLocal, client, hubs) => 
  get('clients').then(e => createHubJob(client.id, forge(e, clientsLocal, client.id)('Forward', 1), () => console.log('Forward queued')))

const moveRight = (data, clientsLocal, client, hubs) =>
  get('clients').then(e => createHubJob(client.id, forge(e, clientsLocal, client.id)('Right', 1), () => console.log('Right queued')))

const moveLeft = (data, clientsLocal, client, hubs) =>
  get('clients').then(e => createHubJob(client.id, forge(e, clientsLocal, client.id)('Left', 1), () => console.log('Left queued')))

module.exports = { moveForward, moveRight, moveLeft }