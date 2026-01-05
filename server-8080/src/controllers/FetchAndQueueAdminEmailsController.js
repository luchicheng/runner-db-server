const imaps = require('imap-simple')
const { simpleParser } = require('mailparser')
require('dotenv').config()
const config = require('../config/config')

const db = require('../models')

const KEYWORD = (config.email && config.email.keyword) ? config.email.keyword : '[TO BE SENT TO ALL MEMBERS]'
// const KEYWORD = 'a test email'

const IMAP_CONFIG = {
  imap: {
    user: config.mail.user,
    password: config.mail.pass,
    host: config.mail.imapHost || config.mail.smtpHost,
    port: config.mail.imapPort,
    tls: config.mail.imapSecure,
    authTimeout: 30000
  }
}

async function fetchAndQueueAdminEmails () {
  // console.log('test1111:' + JSON.stringify(IMAP_CONFIG))
  const connection = await imaps.connect(IMAP_CONFIG)
  try {
    await connection.openBox('INBOX')
    console.log('IMAP connected and INBOX opened successfully')
    // search unseen messages; filter by subject later (safer across providers)
    const searchCriteria = ['UNSEEN']
    const fetchOptions = {
      bodies: [''],
      struct: true,
      markSeen: false // Do not mark as read automatically
    }

    const messages = await connection.search(searchCriteria, fetchOptions)
    // console.log('INBOX email size:' + JSON.stringify(messages))
    const queued = []

    for (const item of messages) {
      const all = item.parts.find(p => p.which === '') || {}
      const raw = all.body || (item.attributes && item.attributes['body[]'])
      const parsed = await simpleParser(raw || '')

      if (!parsed || !parsed.subject) continue
      if (!parsed.subject.includes(KEYWORD)) {
        // optionally mark as seen or skip
        continue
      }
      // console.log('A parsed email:' + JSON.stringify(parsed))
      // build attachment metadata (you can store content or filename as needed)
      const attachments = (parsed.attachments || []).map(a => ({
        filename: a.filename,
        contentType: a.contentType,
        size: a.size
      }))

      // Save email content
      const emailRecord = await db.Email.create({
        subject: parsed.subject,
        body: parsed.text || null,
        html: parsed.html || null,
        from: parsed.from && parsed.from.text ? parsed.from.text : (parsed.from && parsed.from.value && parsed.from.value[0] && parsed.from.value[0].address) || process.env.EMAIL_USER,
        attachment: attachments.length ? JSON.stringify(attachments) : null
      })

      // Debug: show full saved record so we know the PK and fields
      const savedEmail = emailRecord.get ? emailRecord.get({ plain: true }) : emailRecord
      // console.log('Saved Email record:', savedEmail)

      // console.log('A emailRecord:' + JSON.stringify(emailRecord.emailId))
      // find active members (adjust field names if your Member model differs)
      // const members = await db.Member.findAll({ where: { active: true } })
      const members = await db.User.findAll({ where: { id: [190, 99, 67, 31, 187, 175, 4] } })

      const requests = members.map(m => ({
        status: 'pending',
        EmailId: savedEmail.id,
        emailToAddress: m.email2
      }))
      // console.log('requests:', requests)
      await db.EmailSendingRequest.bulkCreate(requests)

      // mark message as SEEN so it won't be reprocessed
      const uid = item.attributes && item.attributes.uid
      if (uid) {
        await connection.addFlags(uid, '\\Seen')
      }

      queued.push({ emailId: emailRecord.id, recipients: requests.length })
    }

    return queued
  } catch (err) {
    console.error('IMAP connect error:', err && err.message ? err.message : err)
    console.error(err)
  } finally {
    connection.end()
  }
}

module.exports = { fetchAndQueueAdminEmails }
