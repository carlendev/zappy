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

//TODO: set to 10
const maxActions = 1000

const nbActions = ({ id }) => new Promise((s, f) => get(id).then(e => {
    const val = parseInt(e)
    if (val >= maxActions) f()
    incr(id).then(s).catch(f)
  }))

const registerAction = (data, clientsLocal, client, hubs) => (name, time) => nbActions(client).then(() => get('clients')
  .then(e => createHubJob(client.id, forge(e, data, clientsLocal, client.id)(name, time), () => logQInfo(`${name} queued`))))
  .catch(() => client.emit('ko'))

const Forward = (...args) => registerAction(...args)('Forward', 1)
const Right = (...args) => registerAction(...args)('Right', 1)
const Left = (...args) => registerAction(...args)('Left', 1)
const Look = (...args) => registerAction(...args)('Look', 1)
const Inventory = (...args) => registerAction(...args)('Inventory', 1)
const ConnectNbr = (...args) => registerAction(...args)('ConnectNbr', 0)
const Take = (...args) => registerAction(...args)('Take', 1)
const Set_ = (...args) => registerAction(...args)('Set_', 1)
const Eject = (...args) => registerAction(...args)('Eject', 1)
const Fork = (...args) => registerAction(...args)('Fork', 42)
const Brodcast = (...args) => registerAction(...args)('Brodcast', 1)
const Incantation = (...args) => registerAction(...args)('Incantation', 30)

module.exports = { Forward, Right, Left, Look, Inventory, Take, Set_, Eject, ConnectNbr, Brodcast, Fork, Incantation }
