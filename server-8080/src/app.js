const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const {sequelize} = require('./models')
const config = require('./config/config')
const emailJobScheduler = require('./jobs/emailJobScheduler')

const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

require('./passport')

require('./routes')(app)

sequelize.sync({force: false})
  .then(() => {
    app.listen(config.port)
    console.log(`Server started on port ${config.port}`)
    if (config.emailJobAutoStart) {
      emailJobScheduler.start()
    } else {
      console.log('Email job scheduler initial status: STOPPED (set EMAIL_JOB_AUTOSTART=true to auto-start)')
    }
  })
