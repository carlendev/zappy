const express = require('express')
const { getRedisThenRes } = require('../../utils/response')
const { log } = require('../../utils/middleware')
const router = express.Router()

router.get('/teams', log, (_, res) => getRedisThenRes(res.json.bind(res))('hubs'))

module.exports = router