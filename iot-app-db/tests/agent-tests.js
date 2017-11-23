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
let uuid = 'yyy-yyy-yyy'

/* Args for Tests */
let testsArgs = {
  uuid: { where: { uuid } },
  connected: { where: { connected: true } },
  username: { where: { username: 'henry', connected: true } }
}

let newAgent = {
  uuid: '123-123-123',
  name: 'test',
  username: 'chris',
  hostname: 'test',
  pid: 0,
  connected: false
}

test.beforeEach(async () => {
  sandbox = sinon.sandbox.create() // un sandbox nos permite guardar registros de invocaciones echas a sinon en un ambiente local, es decir especificamente para la prueba que se este ejecutando, esto tomando en cuenta que se ejecutaran multiples test de manera paralela y todos ellos llamaran al beforeeach

  AgentStub = {
    hasMany: sandbox.spy(),
    findById: sandbox.stub(),
    findOne: sandbox.stub(),
    update: sandbox.stub(),
    create: sandbox.stub(),
    findAll: sandbox.stub()
  }

  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.byId(id)))
  AgentStub.findOne.withArgs(testsArgs.uuid).returns(Promise.resolve(agentFixtures.byUuid(uuid)))
  AgentStub.create.withArgs(newAgent).returns(Promise.resolve({
    toJSON () { return newAgent }
  }))
  AgentStub.update.withArgs(single, testsArgs.uuid).returns(Promise.resolve(single))
  AgentStub.findAll.withArgs(testsArgs.connected).returns(Promise.resolve(agentFixtures.connected))
  AgentStub.findAll.withArgs(testsArgs.username).returns(Promise.resolve(agentFixtures.henry))
  AgentStub.findAll.withArgs().returns(Promise.resolve(agentFixtures.all))

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

  t.true(AgentStub.findById.called, 'findById should be called on model')
  t.true(AgentStub.findById.calledOnce, 'findById should be called once-')
  t.true(AgentStub.findById.calledWith(id), 'findById should be called with specified id')
  t.deepEqual(agent, agentFixtures.byId(id), 'Should be the same')
})

test.serial('Agent#createOrUpdate  - existing', async t => {
  let agent = await db.Agent.createOrUpdate(single)

  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledTwice, 'findOne should be called twice')
  t.true(AgentStub.update.calledOnce, 'update should be called once')

  t.deepEqual(agent, single, 'created agent Should be the same')
})

test.serial('Agent#createOrUpdate  - new', async t => {
  let agent = await db.Agent.createOrUpdate(newAgent)

  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(AgentStub.findOne.calledWith({
    where: {uuid: newAgent.uuid}
  }), 'findOne should be called with uuid args')

  t.true(AgentStub.create.called, 'create should be called on model')
  t.true(AgentStub.create.calledOnce, 'create should be called once')
  t.true(AgentStub.create.calledWith(newAgent), 'create should be called with newAgent args')

  t.deepEqual(agent, newAgent, 'created agent Should be the same')
})

test.serial('Agent#findConnected', async t => {
  let agents = await db.Agent.findConnected()

  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once-')
  t.true(AgentStub.findAll.calledWith(testsArgs.connected), 'findAll should be called with connected Args')
  t.is(agents.length, agentFixtures.connected.length, 'agents should be the same size')
  t.deepEqual(agents, agentFixtures.connected, 'Should be the same objets')
})

test.serial('Agent#findAll', async t => {
  let agents = await db.Agent.findAll()

  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once-')
  t.true(AgentStub.findAll.calledWith(), 'findAll should be called with no Args')
  t.is(agents.length, agentFixtures.all.length, 'agents should be the same size')
  t.deepEqual(agents, agentFixtures.all, 'Should be the same objets')
})

test.serial('Agent#findByUsername', async t => {
  let agents = await db.Agent.findByUsername(testsArgs.username.where.username)

  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once-')
  t.true(AgentStub.findAll.calledWith(testsArgs.username), 'findAll should be called with username Args')
  t.is(agents.length, agentFixtures.henry.length, 'agents should be the same size')
  t.deepEqual(agents, agentFixtures.henry, 'Should be the same objets')
})

test.serial('Agent#findByUuid', async t => {
  let agent = await db.Agent.findByUuid(testsArgs.uuid.where.uuid)

  t.true(AgentStub.findOne.called, 'findAll should be called on model')
  t.true(AgentStub.findOne.calledOnce, 'findAll should be called once-')
  t.true(AgentStub.findOne.calledWith(testsArgs.uuid), 'findAll should be called with uuid Args')
  t.deepEqual(agent, agentFixtures.byUuid(testsArgs.uuid.where.uuid), 'Should be the same objets')
})
