const express = require('express')
const { sendJson, saveRedisThenRes, getRedisThenRes } = require('../../utils/response')
const { mapSize } = require('../../config')
const { mapSizeMapAPI, validate } = require('../../utils/validator')
const { generateMap } = require('../../utils/map')
const { log } = require('../../utils/middleware')
const router = express.Router()

router.get('/map/size', log, (_, res) => getRedisThenRes(res.json.bind(res))('mapSize'))

router.post('/map/size', log, validate(mapSizeMapAPI), (req, res) => saveRedisThenRes(res.json.bind(res))('mapSize', +req.body.mapSize))

//TODO: add id as param for handle multiple hub
//router.get('/map', log, (_, res) => getRedisThenRes(res.json.bind(res))('map'))

//router.post('/map', log, async (_, res) => saveRedisThenRes(res.json.bind(res))('map', (await generateMap())))

module.exports = router