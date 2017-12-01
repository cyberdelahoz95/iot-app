'use strict'
const debug = require('debug')('iot-app:api:db')
module.exports = {
  auth: { secret: process.env.SECRET || 'iot-app' },
  db: {
    database: process.env.DB_NAME || 'iot_app_db',
    username: process.env.DB_USER || 'iot',
    password: process.env.DB_PASS || 'iot',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s)
  }
}
