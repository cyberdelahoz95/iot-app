'use strict'

const debug = require('debug')('iot-app:api')
const express = require('express')

const api = express.Router()

api.get('/agents', (req, res) => {
  debug('A new request to /agents')
  res.send({reply: 'got it'})
})

api.get('/agent/:uuid', (req, res) => {
  const {uuid} = req.params
  res.send({uuid})
})

api.get('/metrics/:uuid', (req, res) => {
  const {uuid} = req.params
  res.send({uuid})
})

api.get('/agent/:uuid/:type', (req, res) => {
  const {uuid, type} = req.params
  res.send({uuid, type})
})

module.exports = api
