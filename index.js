const assert = require('assert')
const NATS = require('nats')
const { isFunction, isObject } = require('./lib/utils')

const subscribeDefaultEvents = Symbol('subscribeDefaultEvents')
const subscribeStartEvents = Symbol('subscribeStartEvents')
const cbHandler = Symbol('cbHandler')

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
    this.#nats = NATS.connect({
      url: address,
      json: true
    })
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

  async [cbHandler](cb, msg, ...args) {
    try {
      await cb(msg, ...args)
    } catch (e) {
      this.#logger.error(e)
    }
  }

  subscribe(name, cb, {
    toGroup = true,
    group = this.#group
  } = {}) {
    toGroup
      ? this.#nats.subscribe(name, { queue: group }, (...args) => this[cbHandler](cb, ...args))
      : this.#nats.subscribe(name, (...args) => this[cbHandler](cb, ...args))
  }

  publish(name, payload) {
    this.#nats.publish(`${this.#group}.${name}`, payload)
  }
}

module.exports = config => new NatsConnector(config)
