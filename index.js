const assert = require('assert')
const NATS = require('nats')
const {
  isFunction,
  isObject,
  isString
} = require('./lib/utils')

const subscribeDefaultEvents = Symbol('subscribeDefaultEvents')
const subscribeStartEvents = Symbol('subscribeStartEvents')

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
    handlers,
    group,
    logger = console,
    isProduction
  }) {
    this.#isProduction = isProduction || process.env.NODE_ENV === 'production'
    this.logger = logger
    this.#group = group
    this.#nats = NATS.connect(address)
    this[subscribeDefaultEvents]()
    this[subscribeStartEvents](handlers)
  }

  [subscribeDefaultEvents]() {
    this.#nats
      .on('connect', () => {
        if (!this.#isProduction) this.#logger.log('NATS connected.')
      })
      .on('error', err => {
        if (!this.#isProduction) this.#logger.error('NATS error: ', err)
      })
  }

  [subscribeStartEvents](handlers) {
    if (isObject(handlers)) {
      for (const [name, callback] of Object.entries(handlers)) {
        this.subscribe(name, callback)
      }
    }
  }

  subscribe(name, callback, {
    toGroup = true,
    group = this.#group
  } = {}) {
    if (toGroup) {
      this.#nats.subscribe(name, { queue: group }, callback)
    } else {
      this.#nats.subscribe(name, callback)
    }
  }

  publish(name, payload) {
    if (!isString(payload)) payload = JSON.stringify(payload)
    this.#nats.publish(`${this.#group}.${name}`, payload)
  }
}

module.exports = config => new NatsConnector(config)
