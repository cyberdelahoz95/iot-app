'use strict'

const debug = require('debug')('iot-app:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')
const db = require('iot-app-db')

const {parsePayload} = require('./utils')

const backend = {
  type: 'redis',
  redis,
  return_buffers: true
}

const settings = {
  port: 1883,
  backend
}

const dbconfig = {
  database: process.env.DB_NAME || 'iot_app_db',
  username: process.env.DB_USER || 'iot',
  password: process.env.DB_PASS || 'iot',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  logging: s => debug(s)
}

const server = new mosca.Server(settings)
let clients = new Map()

let Agent, Metric

server.on('clientConnected', (client) => {
  clients.set(client.id, null)
  console.log(`${chalk.magenta('Client Connected')} ${client.id}`)
})
server.on('clientDisconnected', async (client) => {
  let agent = clients.get(client.id)
  if (agent) {
    agent.connected = false
    try {
      await Agent.createOrUpdate(agent)
    } catch (e) {
      return handleError(e)
    }
      // Delete Agent from connected clients list
    clients.delete(client.id)

    server.publish({
      topic: 'agent/disconnected',
      payload: JSON.stringify({
        agent: {
          uuid: agent.uuid
        }
      })
    })
    debug(`Client ${client.id} associated to Agent ${agent.uuid} is disconnected`)
  }
  console.log(`${chalk.magenta('Client Disconnected')} ${client.id}`)
})
server.on('published', async (packet, client) => {
  console.log(`${chalk.magenta('Received:')} ${packet.topic}`)
  debug(`Payload: ${packet.payload}`)
  switch (packet.topic) {
    case 'agent/connected':
    case 'agent/disconnected':
    default:

      break
    case 'agent/message':
      const payload = parsePayload(packet.payload)
      if (payload) {
        payload.agent.connected = true
        let agent
        try {
          agent = await Agent.createOrUpdate(payload.agent)
        } catch (error) {
          return handleError(error)
        }
        debug(`Agent ${agent.uuid} saved`)

            // Notify that agent was connected
        if (!clients.get(client.id)) {
          clients.set(client.id, agent)
          server.publish({
            topic: 'agent/connected',
            payload: JSON.stringify({
              agent: {
                uuid: agent.uuid,
                name: agent.name,
                hostname: agent.hostname,
                pid: agent.pid,
                connected: agent.connected
              }
            })
          })
        }

        // Storing Metric
        for (let metric of payload.metrics) {
          let m
          try {
            metric = await Metric.create(agent.uuid, metric)
          } catch (error) {
            return handleError(error)
          }
          debug(`Metric ${m.id} saved on Agent ${agent.uuid}`)
        }
      }
      break
  }
})
server.on('ready', async () => {
  const services = await db(dbconfig).catch(handleFatalError)
  Agent = services.Agent
  Metric = services.Metric
  console.log(`${chalk.green('[Iot App MQTT]')} server is running`)
})

server.on('error', handleFatalError)

function handleFatalError (err) {
  handleError(err)
  process.exit(1)
}

function handleError (err) {
  console.error(`${chalk.red('[Fatal Error]')} ${err.message}`)
  console.error(err.stack)
}

process.on('uncaughtException', handleFatalError)
process.on('uncaughtRejection', handleFatalError)
