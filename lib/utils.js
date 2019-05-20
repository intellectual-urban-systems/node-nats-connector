exports.isFunction = func => typeof func === 'function'

exports.isObject = value => {
  const type = typeof value
  return value != null && (type == 'object' || type == 'function')
}

exports.isString = element => typeof element === 'string'
