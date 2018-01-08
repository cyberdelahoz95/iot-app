'use strict'
if (process.env.NODE_ENV !== 'production') require('longjohn')

const http = require('http')
const express = require('express')
const path = require('path')
const debug = require('debug')('iot-app:web')
const chalk = require('chalk')
const socketio = require('socket.io')
const IotAppAgent = require('iot-app-agent')
const {pipe} = require('./utils')
const proxy = require('./proxy')
const asyncify = require('express-asyncify')

const port = process.env.PORT || 8080

const app = asyncify(express())

const server = http.createServer(app)

const io = socketio(server)

const agent = new IotAppAgent()

app.use(express.static(path.join(__dirname, 'public')))
app.use('/', proxy)
// Socket.io / websockets

io.on('connect', socket => {
  debug(`Connected ${socket.id}`)

  /*
  SAMPLE HOW TO USE SOCKET.IO FOR RECEIVE AND EMIT
  socket.on('agent/message', payload => {
    console.log(payload)
  })

  setInterval(() => {
    socket.emit('agent/message', {agent: 'xxx-yyy'})
  }, 5000) */

  /* get events from agent and send them using socket to web dashboard
  agent.on('agent/message', payload => {
      socket.emit('agent/message', payload)
  })

  agent.on('agent/connected', payload => {
    socket.emit('agent/connected', payload)
  })

  agent.on('agent/disconnected', payload => {
    socket.emit('agent/disconnected', payload)
  })
*/

  pipe(agent, socket)
})

app.use((err, req, res, next) => {
  debug(`Error in server.js: ${err.message}`)

  if (err.status) {
    return res.status(err.status).send({error: err.message})
  }
  res.status(500).send({error: err.message})
})

function handleFatalError (err) {
  handleError(err)
  process.exit(1)
}

function handleError (err) {
  console.error(`${chalk.red('[Fatal Error]')} ${err.message}`)
  console.error(err.stack)
}

server.listen(port, () => {
  console.log(`${chalk.green('[IoT App Web]')} server listening on port ${port}`)
  agent.connect()
})

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
