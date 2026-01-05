const db = require('../models')
const { sendMail } = require('../mailers/smtpMailer')
const config = require('../config/config')
const { logger } = require('../utils/logger') || console

const KEYWORD = (config.email && config.email.keyword) ? config.email.keyword : '[TO BE SENT TO ALL MEMBERS]'

/**
 * Find one pending EmailSendingRequest (oldest) and include its Email
 */
async function getNextPendingRequest () {
  return db.EmailSendingRequest.findOne({
    where: { status: 'pending' },
    order: [['createdAt', 'ASC']],
    include: [{ model: db.Email }]
  })
}

/**
 * Find multiple pending EmailSendingRequests (oldest first) up to limit
 */
async function getNextPendingRequests (limit = 1) {
  return db.EmailSendingRequest.findAll({
    where: { status: 'pending' },
    order: [['createdAt', 'ASC']],
    limit,
    include: [{ model: db.Email }]
  })
}

/**
 * Extract inline base64 data-URI images from HTML and turn them into nodemailer attachments (cid).
 * Returns { html, attachments } where html has src="cid:..." replacements.
 */
function extractInlineImages (html) {
  const attachments = []
  if (!html || typeof html !== 'string') return { html, attachments }

  let idx = 0
  const newHtml = html.replace(/<img\s+[^>]*src=(["'])(data:image\/([a-zA-Z0-9+.-]+);base64,([^"']+))\1([^>]*)>/gi,
    (match, quote, dataUri, mimeType, b64data, rest) => {
      const cid = `inline-image-${idx}@local`
      const ext = mimeType === 'jpeg' ? 'jpg' : mimeType
      attachments.push({
        filename: `image-${idx}.${ext}`,
        content: Buffer.from(b64data, 'base64'),
        cid
      })
      idx += 1
      // preserve other attributes; replace the src value only
      return match.replace(dataUri, `cid:${cid}`)
    }
  )

  return { html: newHtml, attachments }
}

/**
 * Send one request (using nodemailer) and update DB status
 */
async function processRequest (request) {
  if (!request) return null
  // Ensure we have plain POJOs
  const reqPlain = request.get ? request.get({ plain: true }) : request

  const email = request.Email || (await db.Email.findByPk(reqPlain.EmailId))
  const rawSubject = email && email.subject ? email.subject : '(no subject)'
  const escapedKeyword = (KEYWORD || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const subject = rawSubject.replace(new RegExp(escapedKeyword, 'gi'), '').replace(/\s+/g, ' ').trim()

  // convert inline data-URI images to attachments + cid references
  const htmlSource = email && email.html ? email.html : undefined
  const { html: processedHtml, attachments: inlineAttachments } = extractInlineImages(htmlSource)

  const mailPayload = {
    from: config.mail.user,
    to: reqPlain.emailToAddress,
    subject: subject || '(no subject)',
    text: htmlSource, // fallback plain text; adjust as needed
    html: processedHtml,
    attachments: inlineAttachments.length ? inlineAttachments : undefined
  }

  try {
    const info = await sendMail(mailPayload)

    // mark request as sent
    await request.update({ status: 'sent', sentDate: new Date() })

    logger.info(`Email sent to ${reqPlain.emailToAddress}: ${info && info.messageId ? info.messageId : 'ok'}`)
    return { success: true, info, requestId: reqPlain.requestId || reqPlain.id }
  } catch (err) {
    // mark request as failed
    try {
      await request.update({ status: 'failed' })
    } catch (e) {
      logger.error('Failed to update request status to failed', e)
    }
    logger.error(`Failed to send email to ${reqPlain.emailToAddress}:`, err && err.message ? err.message : err)
    return { success: false, error: err, requestId: reqPlain.requestId || reqPlain.id }
  }
}

/**
 * Process up to EMAIL_JOB_BATCH_SIZE pending requests sequentially.
 * Reads batch size from config.emailJobBatchSize or process.env.EMAIL_JOB_BATCH_SIZE (fallback 1).
 */
async function processPendingBatch () {
  const batchSize = Number(config.emailJobBatchSize || process.env.EMAIL_JOB_BATCH_SIZE || 1)
  if (batchSize <= 0) {
    logger.warn('EMAIL_JOB_BATCH_SIZE is <= 0, nothing to process')
    return []
  }

  const requests = await getNextPendingRequests(batchSize)
  if (!requests || requests.length === 0) {
    logger.debug && logger.debug('No pending email sending requests found')
    return []
  }

  const results = []
  for (const req of requests) {
    try {
      const res = await processRequest(req)
      results.push(res)
      // Respect per-email pacing if desired: caller/job should enforce interval between batches.
    } catch (err) {
      logger.error('Error processing individual request in batch:', err)
      results.push({ success: false, error: err })
    }
  }

  return results
}

module.exports = { getNextPendingRequest, getNextPendingRequests, processRequest, processPendingBatch }
