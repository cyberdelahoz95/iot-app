'use strict'

const setupDatabase = require('./lib/db')
const setupAgentModel = require('./models/agent')
const setupMetricModel = require('./models/metric')
const defaults = require('defaults')

module.exports = async function (config) {
  config = defaults(config, {
    dialect: 'sqlite',
    pool: {
      max: 10,
      min: 0,
      idle: 10000
    },
    query: {
      raw: true // esta propiedad solicita a sequelize unicamente enviar resultados basicos en json
    }
  })

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
