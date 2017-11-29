'use strict'

const http = require('http')
const express = require('express')
const asyncify = require('express-asyncify')
const chalk = require('chalk')
const debug = require('debug')('iot-app:api')

const api = require('./api')
const port = process.env.PORT || 3000
const app = asyncify(express())

const server = http.createServer(app)

app.use('/api', api)
/** express error handler/ */
app.use((err, req, res, next) => {
  debug(`Error: ${err.message}`)
  if (err.message.match(/not found/)) {
    return res.status(404).send({error: err.message})
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

if (!module.parents) {
  process.on('uncaughtException', handleFatalError)
  process.on('unhandledRejection', handleFatalError)

  server.listen(port, () => {
    console.log(`${chalk.green('[Iot App API]')}  server listenting on ${port}`)
  })
}

module.exports = server
