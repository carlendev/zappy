const express = require('express')
const { sendJson, saveRedisThenRes, getRedisThenRes } = require('../../utils/response')
const { mapSize } = require('../../config')
const { mapSizeMapAPI, validate } = require('../../utils/validator')
const router = express.Router()

router.get('/map/size', (_, res) => getRedisThenRes(res.json.bind(res))('mapSize'))

//TODO(carlendev) check if id is int middleware
router.post('/map/size', validate(mapSizeMapAPI), (req, res) => saveRedisThenRes(res.json.bind(res))('mapSize', +req.body.mapSize))

module.exports = router