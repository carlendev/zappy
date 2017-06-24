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

const createHubQ = (id, fn) => queue.process(id, fn)

//take a layer above for manager hub event and note team event for been able to run multiple hub
const createHubJob = (id, data, done) => queue.create(id, data)
    .priority('critical').attempts(1).backoff(true).removeOnComplete(false)
    .save((err) => {
      if (err) {
        logQError(err)
        done(err)
        return
      }
      done()
    })

module.exports = { createHubJob, createHubQ }
