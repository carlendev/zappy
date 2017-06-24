const { logInfoSocket, logQInfo } = require('../../utils/logger')
const { set, get } = require('../../utils/redisfn')
const { createHubJob } = require('../../queue/index')

const moveForward = (data, clients, client, hubs) => {
  get('clients').then(e => {
    const _clients = JSON.parse(e)
    const _client = _clients.find(c => c.id === client.id)
    const front_id = Object.keys(clients).find(e => clients[e].front === true)
    createHubJob(_client.id, {
      client_id: _client.id,
      front_id: front_id,
      hub: _client.hub,
      id: 'Forward',
      title: 'Forward',
      fn: 'forward',
      time: 1
    }, () => console.log('Forward queued'))
  })
}

const moveRight = (data, clients, client, hubs) => {
  get('clients').then(e => {
    const _clients = JSON.parse(e)
    const _client = _clients.find(c => c.id === client.id)
    const front_id = Object.keys(clients).find(e => clients[e].front === true)
    createHubJob(_client.id, {
      client_id: _client.id,
      front_id: front_id,
      hub: _client.hub,
      id: 'Right',
      title: 'Right',
      fn: 'right',
      time: 1
    }, () => console.log('Right queued'))
  })
}

const moveLeft = (data, clients, client, hubs) => {
  get('clients').then(e => {
    const _clients = JSON.parse(e)
    const _client = _clients.find(c => c.id === client.id)
    const front_id = Object.keys(clients).find(e => clients[e].front === true)
    createHubJob(_client.id, {
      client_id: _client.id,
      front_id: front_id,
      hub: _client.hub,
      id: 'Left',
      title: 'Left',
      fn: 'left',
      time: 1
    }, () => console.log('Left queued'))
  })
}

module.exports = { moveForward, moveRight, moveLeft }