<template>
  <div>    
    <agent
      v-for="agent in agents"
      :uuid="agent.uuid"
      :key="agent.uuid"
      :socket="socket">
    </agent>
    <p v-if="error">{{error}}</p>
  </div>
</template>

<style>
  body {
    font-family: Arial;
    background: #f8f8f8;
    margin: 0;
  }
</style>

<script>
const request = require('request-promise-native')
const {serverHost} = require('../config')
const io = require('socket.io-client')
const socket = io()

module.exports = {
  data () {
    return {
      agents: [],
      error: null,
      socket
    }
  },
  mounted () {
    this.initialize()
  },
  methods: {
    async initialize () {
      const options = {
        method: 'GET',
        url: `${serverHost}/agents`,
        json: true
      }
      let result
      try {
        result = await request(options)
      } catch (error) {
        this.error = e.error.error
        return
      }

      this.agents = result

      socket.on('agent/connected', payload => {
        const {uuid} = payload.agent

        const existing = this.agents.find(a => a.uuid === uuid)

        if(!existing) {
          this.agents.push(payload.agent)
        }
      })
    }
  }
}
</script>