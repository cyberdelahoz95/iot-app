'use strict'
if (process.env.NODE_ENV !== 'production') require('longjohn')

const debug = require('debug')('iot-app:db:setup')

const db = require('./')

const inquirer = require('inquirer')
const minimist = require('minimist')
const chalk = require('chalk')

const args = minimist(process.argv)
const prompt = inquirer.createPromptModule()

async function setup () {
// if (process.argv[2] !== '-y'){
  if (!args.yes) {
    const answer = await prompt([{
      type: 'confirm',
      name: 'setup',
      message: 'This will destroy your database, are you sure?'
    }])

    if (!answer.setup) {
      return console.log('Nothing happened')
    }
  }

  const config = {
    database: process.env.DB_NAME || 'iot_app_db',
    username: process.env.DB_USER || 'iot',
    password: process.env.DB_PASS || 'iot',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s),
    setup: true
  }
  await db(config).catch(handleFatalError)

  console.log('Success')
  process.exit(0)
}

function handleFatalError (err) {
  console.error(`${chalk.red('[Fatal Error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

setup()
