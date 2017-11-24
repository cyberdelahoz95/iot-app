'use strict'

const debug = require('debug')('iot-app:mqtt');
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')

const backend = {
    type: "redis",
    redis,
    return_buffers: true
}

const settings = {
    port: 1883,
    backend
}

const server = new mosca.Server(settings)

server.on('clientConnected', (client) => {
    console.log(`${chalk.magenta('Client Connected')} ${client.id}`)        
})
server.on('clientDisconnected', (client) => {
    console.log(`${chalk.magenta('Client Disconnected')} ${client.id}`)            
})
server.on('published', (packet, client) => {
    console.log(`${chalk.magenta('Received:')} ${packet.topic}`)             
    debug(`Payload: ${packet.payload}`)   
})
server.on('ready', () => {
    console.log(`${chalk.green('[Iot App MQTT]')} server is running`)    
} )