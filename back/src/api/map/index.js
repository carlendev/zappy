const express = require('express')
const { sendJson } = require('../../utils/response')
const { mapSize } = require('../../config')
const router = express.Router()

router.get('/map/size', (_, res) => sendJson(res.json.bind(res))(mapSize))

module.exports = router