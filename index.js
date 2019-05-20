const assert = require('assert')
const NATS = require('nats')
const { isFunction } = require('src/utils')

const subscribeDefaultEvents = Symbol('subscribeDefaultEvents')

class NatsConnector {
  #nats = null
  #group = null
  #logger = console
  #isProduction = false

  set logger(logger) {
    assert(isFunction(logger.log), 'NatsConnector err: logger should implement log method.')
    assert(isFunction(logger.error), 'NatsConnector err: logger should implement error method.')
    this.#logger = logger
  }

  constructor({
    address,
    group,
    logger = console,
    isProduction
  }) {
    this.#isProduction = isProduction || process.env.NODE_ENV === 'production'
    this.logger = logger
    this.#group = group
    this.#nats = NATS.connect(address)
    this[subscribeDefaultEvents]()
  }

  [subscribeDefaultEvents]() {
    this.#nats
      .on('connect', () => {
        if (this.#isProduction) logger.log('NatsConnector connected!')
      })
      .on('error', err => {
        if (this.#isProduction) logger.error('NatsConnector error: ', err)
      })
  }

  subscribe(name, callback, group = this.#group) {
    this.#nats.subscribe(name, { queue: group }, callback)
  }

  publish(name, payload) {
    this.#nats.publish(name, payload)
  }
}

module.exports = config => new NatsConnector(config)
