const { logInfoSocket, logQInfo } = require('../../utils/logger')
const { set, get, incr } = require('../../utils/redisfn')
const { createHubJob } = require('../../queue/index')

const getFrontId = clients => Object.keys(clients).find(e => clients[e].front === true)

const getClientById = (clients, id) => clients.find(c => c.id === id)

const forgeClientInfo = (client, front_id) => ({ client_id: client.id, front_id, hub: client.hub })

const forgeInfoString = (action, time) => ({ id: action, title: action, fn: action.toLowerCase(), time })

const forge = (e, data, clientsLocal, id) => {
  const clients = JSON.parse(e)
  const front_id = getFrontId(clientsLocal)
  const client = getClientById(clients, id)
  return (action, time) => Object.assign(forgeClientInfo(client, front_id), forgeInfoString(action, time), (data) ? data : {})
}

const maxActions = 1000

const nbActions = ({ id }) => new Promise((s, f) => get(id).then(e => {
    const val = parseInt(e)
    if (val >= maxActions) f()
    incr(id).then(s).catch(f)
  }))

const Forward = (data, clientsLocal, client, hubs) => nbActions(client).then(() => 
  get('clients').then(e => createHubJob(client.id, forge(e, data, clientsLocal, client.id)('Forward', 1), () => logQInfo('Forward queued'))))
  .catch(() => client.emit('ko'))

const Right = (data, clientsLocal, client, hubs) => nbActions(client).then(() => 
  get('clients').then(e => createHubJob(client.id, forge(e, data, clientsLocal, client.id)('Right', 1), () => logQInfo('Right queued'))))
  .catch(() => client.emit('ko'))

const Left = (data, clientsLocal, client, hubs) => nbActions(client).then(() => 
  get('clients').then(e => createHubJob(client.id, forge(e, data, clientsLocal, client.id)('Left', 1), () => logQInfo('Left queued'))))
  .catch(() => client.emit('ko'))

const Look = (data, clientsLocal, client, hubs) => nbActions(client).then(() => 
  get('clients').then(e => createHubJob(client.id, forge(e, data, clientsLocal, client.id)('Look', 1), () => logQInfo('Look queued'))))
  .catch(() => client.emit('ko'))

const Inventory = (data, clientsLocal, client, hubs) => nbActions(client).then(() => 
  get('clients').then(e => createHubJob(client.id, forge(e, data, clientsLocal, client.id)('Inventory', 1), () => logQInfo('Inventory queued'))))
  .catch(() => client.emit('ko'))

const ConnectNbr = (data, clientsLocal, client, hubs) => nbActions(client).then(() => 
  get('clients').then(e => createHubJob(client.id, forge(e, clientsLocal, client.id)('ConnectNbr', 0), () => logQInfo('Connect Nbr queued'))))
  .catch(() => client.emit('ko'))

const Take = (data, clientsLocal, client, hubs) => nbActions(client).then(() => 
  get('clients').then(e => createHubJob(client.id, forge(e, data, clientsLocal, client.id)('Take', 1), () => logQInfo('Take queued'))))
  .catch(() => client.emit('ko'))

const Set_ = (data, clientsLocal, client, hubs) => nbActions(client).then(() => 
  get('clients').then(e => createHubJob(client.id, forge(e, data, clientsLocal, client.id)('Set_', 1), () => logQInfo('Set queued'))))
  .catch(() => client.emit('ko'))

const Eject = (data, clientsLocal, client, hubs) => nbActions(client).then(() => 
  get('clients').then(e => createHubJob(client.id, forge(e, data, clientsLocal, client.id)('Eject', 1), () => logQInfo('Eject queued'))))
  .catch(() => client.emit('ko'))

const Fork = (data, clientsLocal, client, hubs) => nbActions(client).then(() => 
  get('clients').then(e => createHubJob(client.id, forge(e, data, clientsLocal, client.id)('Fork', 42), () => logQInfo('Fork queued'))))
  .catch(() => client.emit('ko'))

const Brodcast = (data, clientsLocal, client, hubs) => nbActions(client).then(() => 
  get('clients').then(e => createHubJob(client.id, forge(e, data, clientsLocal, client.id)('Brodcast', 1), () => logQInfo('Brodcast queued')))
  .catch(() => client.emit('ko')))

module.exports = { Forward, Right, Left, Look, Inventory, Take, Set_, Eject, ConnectNbr, Brodcast, Fork }
