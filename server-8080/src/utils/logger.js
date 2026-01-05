const util = require('util')

const levels = { error: 0, warn: 1, info: 2, debug: 3 }
const env = process.env.NODE_ENV || 'development'
const configuredLevel = process.env.LOG_LEVEL || (env === 'production' ? 'info' : 'debug')

function shouldLog (level) {
  return levels[level] <= levels[configuredLevel]
}

function format (level, msg, ...meta) {
  const timestamp = new Date().toISOString()
  const metaStr = meta && meta.length
    ? meta.map(m => (typeof m === 'string' ? m : util.inspect(m, { depth: 5 }))).join(' ')
    : ''
  return `${timestamp} [${level.toUpperCase()}] ${msg}${metaStr ? ' ' + metaStr : ''}`
}

const logger = {
  error: (msg, ...meta) => { if (shouldLog('error')) console.error(format('error', msg, ...meta)) },
  warn: (msg, ...meta) => { if (shouldLog('warn')) console.warn(format('warn', msg, ...meta)) },
  info: (msg, ...meta) => { if (shouldLog('info')) console.info(format('info', msg, ...meta)) },
  debug: (msg, ...meta) => { if (shouldLog('debug')) console.debug(format('debug', msg, ...meta)) },

  // morgan / stream compatibility
  stream: {
    write: (message) => {
      // morgan passes a newline-terminated string
      logger.info(message.trim())
    }
  }
}

module.exports = { logger }
