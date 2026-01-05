const config = require('../config/config')
// const emailService = require('../services/emailService')
const { logger } = require('../utils/logger') || console
const { processPendingBatch } = require('../services/emailService')

let timer = null
let running = false

async function sendEmailJobOnce () {
  if (running) {
    logger.info && logger.info('Email job already running; skipping this interval')
    return
  }
  running = true
  try {
    const req = await processPendingBatch()
    if (!req) {
      logger.debug && logger.debug('No pending email sending requests found')
      return
    }
  } catch (err) {
    logger.error && logger.error('Email job failed', err)
  } finally {
    running = false
  }
}

function start () {
  if (timer) return
  const intervalMs = Math.max(1000, Number(config.emailJobIntervalSeconds || 60) * 1000)
  // run immediately, then schedule
  sendEmailJobOnce().catch(err => logger.error && logger.error(err))
  timer = setInterval(() => sendEmailJobOnce().catch(err => logger.error && logger.error(err)), intervalMs)

  process.once('SIGINT', stop)
  process.once('SIGTERM', stop)
  logger.info && logger.info(`Email job scheduler started (interval ${intervalMs}ms)`)
}

function stop () {
  if (!timer) return
  clearInterval(timer)
  timer = null
  logger.info && logger.info('Email job scheduler stopped')
}

// // simple sleep helper
// function sleep (ms) {
//   return new Promise(resolve => setTimeout(resolve, ms))
// }

// usage in async function
// async function doWork () {
//   logger.info('doWork start')
//   await sleep(5000) // 5 seconds
//   logger.info('doWork done after 5s')
// }

module.exports = { start, stop, sendEmailJobOnce }
