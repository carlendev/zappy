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

queue.process('move', (job, done) => {  
  const data = job.data
  //do other stuff with the data.
  logQInfo(`move Job ${data.title} ${data.id}`)
  setTimeout(() => job.progress(50, data.frame), 5000)
  setTimeout(() => job.progress(75, data.frame), 7500)
  setTimeout(() => done(), 10000)
})

const createMove = (data, done) => queue.create('move', data)
    .priority('critical')
    .attempts(8)
    .backoff(true)
    .removeOnComplete(false)
    .save((err) => {
      if (err) {
        logQError(err)
        done(err)
        return
      }
      done()
    })

setTimeout(() => {
  createMove({ id: 'move', title: 'move player', frame: 100 }, () => console.info('move done'))
  setTimeout(() => createMove({ id: 'move1', title: 'move player', frame: 100 }, () => console.info('move1 done')))
}, 5000)

module.exports = { createMove }