const { logQInfo, logQError } = require('../utils/logger')
const kue = require('kue')

const queue = kue.createQueue()

queue.watchStuckJobs(10000)

queue.on('ready', () => {  
  logQInfo('Queue is ready!')
})

queue.on('error', err => {  
  logQError(err)
  logQError(err.stack)
})

queue.on('job complete', (id, result) => {
  kue.Job.get(id, (err, job) => {
    if (err) logQError('Can\'t get job complete')
    else logQInfo(`Completed job ${job.id}`)
  })
})

const createHub = (id, queue, fn) => queue.process(id, fn)

/*
queue.process('move', (job, done) => {  
  const data = job.data
  //do other stuff with the data.
  logQInfo(`move Job ${data.title} ${data.id}`)
  setTimeout(() => job.progress(50, data.frame), 5000)
  setTimeout(() => job.progress(75, data.frame), 7500)
  setTimeout(() => done(), 10000)
})
*/

//take a layer above for manager hub event and note team event for been able to run multiple hub
const createHubJob = (id, data, done) => queue.create(id, data)
    .priority('critical').attempts(2).backoff(true).removeOnComplete(false)
    .save((err) => {
      if (err) {
        logQError(err)
        done(err)
        return
      }
      done()
    })


//TEST
createHub('hub1', queue, (job, done) => {
  const data = job.data
  //do other stuff with the data.
  logQInfo(`move Job ${data.hub} ${data.title} ${data.id}`)
  setTimeout(() => job.progress(50, data.frame), 5000)
  setTimeout(() => job.progress(75, data.frame), 7500)
  setTimeout(() => done(), 10000)
})

createHub('hub2', queue, (job, done) => {
  const data = job.data
  //do other stuff with the data.
  logQInfo(`move Job ${data.hub} ${data.title} ${data.id}`)
  setTimeout(() => job.progress(50, data.frame), 5000)
  setTimeout(() => job.progress(75, data.frame), 7500)
  setTimeout(() => done(), 10000)
})

setTimeout(() => {
  createHubJob('hub1', { hub: 'hub1', id: 'move', title: 'move player', frame: 100 }, () => console.info('move saved'))
  createHubJob('hub2', { hub: 'hub2', id: 'move1', title: 'move player', frame: 100 }, () => console.info('move1 saved'))
  createHubJob('hub1', { hub: 'hub1', id: 'move', title: 'move player', frame: 100 }, () => console.info('move saved'))
}, 5000)

module.exports = { createHubJob }
