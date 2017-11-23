'use strict'

const agentFixtures = require('./agent')

const metric = {
  agentId: 1,
  id: 1,
  type: 'RFID',
  value: 'RFFID123456789',
  createdAt: new Date(),
  updatedAt: new Date()
}

const metrics = [
  metric,
  extend(metric, { agentId: 1, id: 2, type: 'TUBING PIPE', value: 'RFFID123456789' }),
  extend(metric, { agentId: 2, id: 3, type: 'CASING PIPE' }),
  extend(metric, { agentId: 3, id: 3, type: 'DRILL PIPE' })
]

function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

module.exports = {
  single: metric,
  all: metrics,
  byAgentUuid,
  byTypeAgentUuid
}

function byAgentUuid (uuid) {
  let agent = agentFixtures.byUuid(uuid)
  return metrics.filter(metric => metric.agentId === agent.id)
}

function byTypeAgentUuid (uuid, type) {
  let metricsByAgent = byAgentUuid(uuid)
  return metricsByAgent.filter(metric => metric.type === type)
}