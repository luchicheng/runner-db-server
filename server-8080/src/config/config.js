const path = require('path')
const dotenv = require('dotenv')
console.log('Loading environment variables...')
const env = process.env.NODE_ENV || 'development'
console.log(`Current environment: ${env}`)
console.log(`Current working directory: ${process.cwd()}`)
// load common .env then override with .env.{env} if present
const envEnvPath = path.resolve(process.cwd(), `.env.${env}`)
console.log(`Looking for .env.${env} at: ${envEnvPath}`)
const result2 = dotenv.config({ path: envEnvPath })
if (result2.error) {
  console.log(`.env.${env} file not found or error: ${result2.error.message}`)
}

console.log('Environment variables loaded:', {
  NODE_ENV: env,
  EMAIL_USER: process.env.EMAIL_USER,
  IMAP_HOST: process.env.IMAP_HOST,
  IMAP_PORT: process.env.IMAP_PORT,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  EMAIL_JOB_INTERVAL: process.env.EMAIL_JOB_INTERVAL,
  EMAIL_JOB_BATCH_SIZE: process.env.EMAIL_JOB_BATCH_SIZE,
  EMAIL_JOB_AUTOSTART: process.env.EMAIL_JOB_AUTOSTART,
  STRIPE_API_KEY: process.env.STRIPE_API_KEY ? '***set***' : undefined
})

module.exports = {
  port: process.env.PORT || 8081,
  db: {
    database: process.env.DB_NAME || 'tabtracker',
    user: process.env.DB_USER || 'tabtracker',
    password: process.env.DB_PASS || 'tabtracker',
    backup_folder: path.resolve('../dbbackup/'),
    options: {
      dialect: process.env.DIALECT || 'sqlite',
      host: process.env.HOST || 'localhost',
      storage: path.resolve(__dirname, '../../tabtracker.sqlite'),
      omitNull: false
    }
  },
  authentication: {
    jwtSecret: process.env.JWT_SECRET || 'secret'
  },
  env,
  mail: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    imapHost: process.env.IMAP_HOST,
    imapPort: Number(process.env.IMAP_PORT || 993),
    imapSecure: (process.env.IMAP_SECURE || 'true') === 'true',
    smtpHost: process.env.SMTP_HOST,
    smtpPort: Number(process.env.SMTP_PORT || 465),
    smtpSecure: (process.env.SMTP_SECURE || 'true') === 'true'
  },
  email: {
    // move the admin email keyword into config (can be overridden via env)
    keyword: process.env.EMAIL_KEYWORD || '[TO BE SENT TO ALL MEMBERS]'
  },
  emailJobIntervalSeconds: Number(process.env.EMAIL_JOB_INTERVAL || 60),
  emailJobBatchSize: Number(process.env.EMAIL_JOB_BATCH_SIZE || 1),
  emailJobAutoStart: (process.env.EMAIL_JOB_AUTOSTART || 'false') === 'true',
  stripe: {
    secretKey: process.env.STRIPE_API_KEY
  }
}
