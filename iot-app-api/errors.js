'use strict'

class AgentNotFoundError extends Error {
  constructor (givenUuid, ...params) {
      // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)

    this.givenUuid = givenUuid
    this.code = 404

      // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AgentNotFoundError)
    }

    this.message = `Agent with UUID ${givenUuid} not found in DataBase`
  }
  }
  class MetricsNotFoundError extends Error {
    constructor (givenUuid,type, ...params) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
      super(...params)
  
      this.givenUuid = givenUuid
      this.type = type || null
      this.code = 404
  
        // Maintains proper stack trace for where our error was thrown (only available on V8)
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, AgentNotFoundError)
      }

      this.message = (type)? `Metrics of Agent with UUID ${givenUuid} and type ${type} not found in DataBase` :`Agent with UUID ${givenUuid} not Found in DataBase`
    }
    }
class NotAuthorizedError extends Error {
  constructor (...params) {
      // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)

    this.code = 401
    
      // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AgentNotFoundError)
    }

    this.message = `This user is not authorized to access the requested content`
  }
  }

class NotAuthenticatedError extends Error {
  constructor (givenUuid, ...params) {
      // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)

    this.givenUuid = givenUuid
    this.code = 401

      // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AgentNotFoundError)
    }

    this.message = `User is not authenticated`
  }
  }

module.exports = {AgentNotFoundError, NotAuthenticatedError, NotAuthorizedError, MetricsNotFoundError}
