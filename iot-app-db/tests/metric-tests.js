'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')
const sinon = require('sinon')

const agentFixtures = require('./fixtures/agent')
const metricFixtures = require('./fixtures/metric')

let sandbox = null
let db = null

let id = 1
let agentUuid = 'yyy-yyy-yyy'
let type = 'RFID'

let MetricStub = null

let single = Object.assign({}, metricFixtures.single)

let AgentStub = {
  hasMany: sinon.spy(),
  findOne: sinon.stub()
}

AgentStub.findOne.withArgs(agentUuid).returns(Promise.resolve(agentFixtures.byUuid(agentUuid)))

let config = {
  logging: function () {} // deshabilita el logging a la db
}

/* Args for Tests */
let testsArgs = {
  type: { where: { type } },
  bytypeAgentUuid: {
    attributes: ['id', 'type', 'value', 'createdAt'],
    where: {
      type
    },
    limit: 20,
    order: [['createdAt', 'DESC']],
    include: [{
      attributes: [],
      model: AgentStub,
      where: {
        uuid: agentUuid
      }
    }],
    raw: true
  },
  byAgentUuid: {
    attributes: ['type'],
    group: ['type'],
    include: [{
      attributes: [],
      model: AgentStub,
      where: {
        uuid: agentUuid
      }
    }],
    raw: true
  }
}

let newMetric = {
  value: 'temp1236548,89',
  type: 'CASING'
}

test.beforeEach(async () => {
  sandbox = sinon.sandbox.create() // un sandbox nos permite guardar registros de invocaciones echas a sinon en un ambiente local, es decir especificamente para la prueba que se este ejecutando, esto tomando en cuenta que se ejecutaran multiples test de manera paralela y todos ellos llamaran al beforeeach

  MetricStub = {
    belongsTo: sandbox.spy(), // sinon.spy nos permite tener un registro de las veces que la funcion fue llamada de tal forma que se pueda comprobar que se invoco el metodo que implementa la funcion
    findAll: sandbox.stub(),
    create: sandbox.stub()
  }

  MetricStub.create.withArgs(newMetric).returns(Promise.resolve({
    toJSON () { return newMetric }
  }))

  MetricStub.findAll.withArgs(testsArgs.bytypeAgentUuid).returns(Promise.resolve(metricFixtures.byTypeAgentUuid(agentUuid, type)))
  MetricStub.findAll.withArgs(testsArgs.byAgentUuid).returns(Promise.resolve(metricFixtures.byAgentUuid(agentUuid)))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })
  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sinon.sandbox.restore()
})

test('Metric', t => {
  t.truthy(db.Metric, 'Metric service should exist')
})

test.serial('Metric#findByAgentUuid', async t => {
  let metrics = await db.Metric.findByAgentUuid(agentUuid)

  t.true(MetricStub.findAll.called, 'findAll should be called on model')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once-')
  t.true(MetricStub.findAll.calledWith(testsArgs.byAgentUuid), 'findAll should be called with proper args')
  t.deepEqual(metrics, metricFixtures.byAgentUuid(agentUuid), 'Should be the same')
})

test.serial('Metric#findByTypeAgentUuid', async t => {
  let metrics = await db.Metric.findByTypeAgentUuid(type, agentUuid)

  t.true(MetricStub.findAll.called, 'findAll should be called on model')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once-')
  t.true(MetricStub.findAll.calledWith(testsArgs.bytypeAgentUuid), 'findAll should be called with proper args')
  t.deepEqual(metrics, metricFixtures.byTypeAgentUuid(agentUuid, type), 'Should be the same')
})
