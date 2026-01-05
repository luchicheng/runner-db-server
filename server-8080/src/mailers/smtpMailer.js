const nodemailer = require('nodemailer')
const config = require('../config/config')
require('dotenv').config()

const transporter = nodemailer.createTransport({
  host: config.mail.smtpHost,
  port: config.mail.smtpPort,
  secure: config.mail.smtpSecure,
  auth: {
    user: config.mail.user,
    pass: config.mail.pass
  }
})

async function sendMail ({ from, to, subject, text, html, attachments }) {
  const mailOptions = {
    from: from || config.mail.user,
    to,
    subject,
    text,
    html,
    attachments // array of { filename, content } if provided
  }
  return transporter.sendMail(mailOptions)
}

module.exports = { sendMail }
