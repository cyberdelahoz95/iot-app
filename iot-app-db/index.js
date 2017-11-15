'use strict'

const setupDatabase = require('./lib/db')
const setupAgentModel = require('./lib/models/agent')
const setupMetricModel = require('./lib/models/metric')

module.exports = async function (config) {
  const sequelize = setupDatabase(config)
  const AgentModel = setupAgentModel(config)
  const MetricModel = setupMetricModel(config)

  AgentModel.hasMany(MetricModel)
  MetricModel.belongsTo(AgentModel)

  await sequelize.authenticate() // authenticate valida que se exista una conexion bien configurada con la db

  if (config.setup) {
    await sequelize.sync({force: true})
  }

  const Agent = {}
  const Metric = {}

  return {
    Agent,
    Metric
  }
}
