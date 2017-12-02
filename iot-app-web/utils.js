'use strict'
const errors = require('./errors')

function pipe (source, target) {
  if (!source.emit || !target.emit) {
    throw errors.NoProperEventEmittersInParameters()
  }

  const emit = source._emit = source.emit

  source.emit = function () {
    emit.apply(source, arguments) // se invoca al emit original del source (es decir el del agent)
    target.emit.apply(target, arguments) // se invoca al emit del target (el de socket io) inyectandole los argumentos de source
    return source // se retorna el objeto source modificado
  }
}

module.exports = {
  pipe
}
