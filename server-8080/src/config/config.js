const path = require('path')
const dotenv = require('dotenv')

const env = process.env.NODE_ENV || 'development'
// load common .env then override with .env.{env} if present
dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), `.env.${env}`) })

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
  stripe: {
    secretKey: process.env.STRIPE_API_KEY
  }
}
