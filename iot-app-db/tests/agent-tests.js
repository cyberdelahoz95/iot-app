'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')
const sinon = require('sinon')

const agentFixtures = require('./fixtures/agent')

let sandbox = null
let db = null
let MetricStub = {
  belongsTo: sinon.spy() // sinon.spy nos permite tener un registro de las veces que la funcion fue llamada de tal forma que se pueda comprobar que se invoco el metodo que implementa la funcion
}
let single = Object.assign({}, agentFixtures.single)
let AgentStub = null
let config = {
  logging: function () {} // deshabilita el logging a la db
}
let id = 1

test.beforeEach(async () => {
  sandbox = sinon.sandbox.create() // un sandbox nos permite guardar registros de invocaciones echas a sinon en un ambiente local, es decir especificamente para la prueba que se este ejecutando, esto tomando en cuenta que se ejecutaran multiples test de manera paralela y todos ellos llamaran al beforeeach

  AgentStub = {
    hasMany: sandbox.spy(),
    findById: sandbox.stub()
  }

  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.byId(id)))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })
  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sinon.sandbox.restore()
})

test('Agent', t => {
  t.truthy(db.Agent, 'Agent service should exist')
})

test.serial('Setup', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be Metric Model')
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was executed')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be Agent Model')
})

test.serial('Agent#findById', async t => {
  let agent = await db.Agent.findById(id)

  t.deepEqual(agent, agentFixtures.byId(id), 'Should be the same')
})