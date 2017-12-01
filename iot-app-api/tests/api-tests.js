'use strict'

const test = require('ava')
const request = require('supertest')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const util = require('util')

const agentFixtures = require('./fixtures/agent')
const metricFixtures = require('./fixtures/metric')
const config = require('../config')
const auth = require('../auth')
const sign = util.promisify(auth.sign)

let sandbox = null
let server = null
let dbStub = null
let token = null
let AgentStub = {}
let MetricStub = {}
const uuid = 'yyy-yyy-yyy'
const wrongUuid = 'xxx-yyy-yyy'
const type = 'RFID'

test.beforeEach(async () => {
  sandbox = sinon.sandbox.create()
  token = await sign({admin: true, username: 'iot-app', permissions: ['metrics:read']}, config.auth.secret)
  dbStub = sandbox.stub()
  dbStub.returns(Promise.resolve({
    Agent: AgentStub,
    Metric: MetricStub
  }))

  AgentStub.findConnected = sandbox.stub()
  AgentStub.findConnected.returns(Promise.resolve(agentFixtures.connected))

  AgentStub.findByUuid = sandbox.stub()
  AgentStub.findByUuid.withArgs(uuid).returns(Promise.resolve(agentFixtures.byUuid(uuid)))
  AgentStub.findByUuid.withArgs(wrongUuid).returns(Promise.resolve(null))

  MetricStub.findByAgentUuid = sandbox.stub()
  MetricStub.findByAgentUuid.withArgs(uuid).returns(Promise.resolve(metricFixtures.byAgentUuid(uuid)))
  MetricStub.findByAgentUuid.withArgs(wrongUuid).returns(Promise.resolve(null))

  MetricStub.findByTypeAgentUuid = sandbox.stub()
  MetricStub.findByTypeAgentUuid.withArgs(type, uuid).returns(Promise.resolve(metricFixtures.byTypeAgentUuid(uuid, type)))
  MetricStub.findByTypeAgentUuid.withArgs(type, wrongUuid).returns(Promise.resolve(null))

  const api = proxyquire('../api', {
    'iot-app-db': dbStub
  })

  server = proxyquire('../server', {
    './api': api
  })
})

test.afterEach(() => {
  sandbox && sinon.sandbox.restore()
})

test.serial.cb('testing /api/agents - no token', t => {
  request(server)
      .get('/api/agents')
      .expect(401)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) { console.log(`Error in Test ${err.message}`) }
        t.is(res.statusCode, 401, 'Error must be Unauthorized User')
        t.end() // only work with callbacks cb()
      })
})
test.serial.cb('testing /api/agents', t => {
  request(server)
      .get('/api/agents')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        t.falsy(err, 'should not return an error')
        let body = JSON.stringify(res.body)
        let expected = JSON.stringify(agentFixtures.connected)
        t.deepEqual(body, expected, 'response body should be the expected')
        t.end() // only work with callbacks cb()
      })
}) // utilizamos callbacks porque supertest no trabaja con async await sino con callbacks unicamente

test.serial.cb('testing /api/agent/:uuid', t => {
  request(server)
      .get(`/api/agent/${uuid}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        t.falsy(err, 'should not return an error')
        let body = JSON.stringify(res.body)
        let expected = JSON.stringify(agentFixtures.byUuid(uuid))
        t.deepEqual(body, expected, 'response body should be the expected')
        t.end() // only work with callbacks cb()
      })
})
test.serial.cb('testing /api/agent/:uuid - no token', t => {
  request(server)
      .get(`/api/agent/${uuid}`)
      .expect(401)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) { console.log(`Error in Test ${err.message}`) }
        t.is(res.statusCode, 401, 'Error must be Unauthorized User')
        t.end() // only work with callbacks cb()
      })
})
test.serial.cb('testing /api/agent/:uuid - not found', t => {
  request(server)
      .get(`/api/agent/${wrongUuid}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) {
          console.log(err)
        }
        t.truthy(res.body.error, 'should return an error')
        t.regex(res.body.error, /not found/, 'Error should contains not found')
        t.end() // only work with callbacks cb()
      })
})

test.serial.cb('testing /api/metrics/:uuid', t => {
  request(server)
      .get(`/api/metrics/${uuid}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        t.falsy(err, 'should not return an error')
        let body = JSON.stringify(res.body)
        let expected = JSON.stringify(metricFixtures.byAgentUuid(uuid))
        t.deepEqual(body, expected, 'response body should be the expected')
        t.end() // only work with callbacks cb()
      })
})
test.serial.cb('testing /api/metrics/:uuid - no token', t => {
  request(server)
      .get(`/api/metrics/${uuid}`)
      .expect(401)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) { console.log(`Error in Test ${err.message}`) }
        t.is(res.statusCode, 401, 'Error must be Unauthorized User')
        t.end() // only work with callbacks cb()
      })
})
test.serial.cb('testing /api/metrics/:uuid - not found', t => {
  request(server)
      .get(`/api/metrics/${wrongUuid}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) {
          console.log(err)
        }
        t.truthy(res.body.error, 'should return an error')
        t.regex(res.body.error, /not found/, 'Error should contains not found')
        t.end() // only work with callbacks cb()
      })
})

test.serial.cb('testing /api/metrics/:uuid/:type', t => {
  request(server)
      .get(`/api/metrics/${uuid}/${type}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        t.falsy(err, 'should not return an error')
        let body = JSON.stringify(res.body)
        let expected = JSON.stringify(metricFixtures.byTypeAgentUuid(uuid, type))
        t.deepEqual(body, expected, 'response body should be the expected')
        t.end() // only work with callbacks cb()
      })
})
test.serial.cb('testing /api/metrics/:uuid/:type - no token', t => {
  request(server)
      .get(`/api/metrics/${uuid}/${type}`)
      .expect(401)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) { console.log(`Error in Test ${err.message}`) }
        t.is(res.statusCode, 401, 'Error must be Unauthorized User')
        t.end() // only work with callbacks cb()
      })
})
test.serial.cb('testing /api/metrics/:uuid/:type - not found', t => {
  request(server)
      .get(`/api/metrics/${wrongUuid}/${type}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) {
          console.log(err)
        }
        t.truthy(res.body.error, 'should return an error')
        t.regex(res.body.error, /not found/, 'Error should contains not found')
        t.end() // only work with callbacks cb()
      })
})
