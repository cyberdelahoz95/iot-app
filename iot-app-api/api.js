'use strict'

const debug = require('debug')('iot-app:api')
const express = require('express')
const asyncify = require('express-asyncify')
const auth = require('express-jwt')
const guard = require('express-jwt-permissions')() // se invoca como una funcion q devuelve una instancia de express-jwt-permissions
const db = require('iot-app-db')
const errors = require('./errors')
const config = require('./config')

const api = asyncify(express.Router())

let services, Agent
let Metric

api.use('*', async (req, res, next) => {
  if (!services) {
    try {
      services = await db(config.db)
    } catch (e) {
      return next(e)
    }
    Agent = services.Agent
    Metric = services.Metric
  }
  next()
})

api.get('/agents', auth(config.auth), async (req, res, next) => {
  debug('A new request to /agents')

  const {user} = req

  if (!user || !user.username) {
    return next(errors.NotAuthorizedError())
  }

  let agents = []
  try {
    if (user.admin) agents = await Agent.findConnected()
    else agents = await Agent.findByUsername(user.username)
  } catch (e) {
    return next(e)
  }
  res.send(agents)
})

api.get('/agent/:uuid', auth(config.auth), async (req, res, next) => {
  const {uuid} = req.params
  debug(`A new request to /agent/${uuid}`)

  let agent
  try {
    agent = await Agent.findByUuid(uuid)
  } catch (e) {
    return next(e)
  }
  if (!agent) {
    return next(new errors.AgentNotFoundError(uuid))
  }
  res.send(agent)
})

api.get('/metrics/:uuid', auth(config.auth), guard.check(['metrics:read']), async (req, res, next) => {
  const {uuid} = req.params
  debug(`A new request to /metrics/${uuid}`)

  let metrics = []
  try {
    metrics = await Metric.findByAgentUuid(uuid)
  } catch (error) {
    return next(error)
  }
  if (!metrics || metrics.length === 0) {
    return next(new errors.MetricsNotFoundError(uuid))
  }
  res.send(metrics)
})

api.get('/metrics/:uuid/:type', auth(config.auth), async (req, res, next) => {
  const {uuid, type} = req.params
  debug(`A new request to /metrics/${uuid}/${type}`)
  let metrics = []
  try {
    metrics = await Metric.findByTypeAgentUuid(type, uuid)
  } catch (error) {
    return next(error)
  }
  if (!metrics || metrics.length === 0) {
    return next(new errors.MetricsNotFoundError(uuid, type))
  }
  res.send(metrics)
})

module.exports = api
