const {User, Runner} = require('../models')
const jwt = require('jsonwebtoken')
const config = require('../config/config')

function jwtSignUser (user) {
  const ONE_WEEK = 60 * 60 * 24 * 7
  return jwt.sign(user, config.authentication.jwtSecret, {
    expiresIn: ONE_WEEK
  })
}

module.exports = {
  async register (req, res) {
    try {
      let userInfo = req.body.userInfo
      const runnerInfo = req.body.runnerInfo
      const existUser = await User.findOne({
        where: {
          email: userInfo.email
        }
      })
      if (existUser) {
        return res.status(500).send({
          error: 'This ID already exists, please change to another one.'
        })
      }
      const runner = await Runner.create(runnerInfo)
      const TODAY = new Date().toISOString().slice(0, 10)
      userInfo.RunnerId = runner.id
      userInfo.registerDate = TODAY
      var dt = new Date()
      dt.setMonth(dt.getMonth() + 1)
      const ONE_MONTH_LATER = dt.toISOString().slice(0, 10)

      // give one month free
      userInfo.userType = 'R'
      userInfo.membershipExprireDate = ONE_MONTH_LATER
      userInfo.status = 'I'
      userInfo.comment = runnerInfo.name
      const user = await User.create(userInfo)
      const userJson = user.toJSON()
      // dont' send token back, as we leave the user inactive
      res.send({
        user: userJson
        // token: jwtSignUser(userJson)
      })
    } catch (err) {
      return res.status(400).send({
        error: 'An error has occured trying to register this user.'
      })
    }
  },
  async passwordReset (req, res) {
    try {
      const userId = req.body.userId
      const password = req.body.password
      const user = await User.findOne({
        where: {
          id: userId
        }
      })
      if (!user) {
        return res.status(500).send({
          error: 'This user does not exist:' + userId
        })
      }
      if (userId) {
        await User.update({password: password}, {
          where: {
            id: userId
          },
          individualHooks: true
        })
      }
    } catch (err) {
      return res.status(500).send({
        error: 'An error has occured trying to reset user password'
      })
    }
  },
  async login (req, res) {
    try {
      const {email, password} = req.body
      const user = await User.findOne({
        where: {
          email: email
        },
        include: [
          {
            model: Runner
          }
        ]
      })
      if (!user) {
        return res.status(403).send({
          error: 'The login information was incorrect: Error 011'
        })
      }
      if (user.status === 'I') {
        return res.status(403).send({
          error: 'The login information was incorrect: Error 013'
        })
      }
      const now = new Date()
      const expireDate = new Date(user.membershipExprireDate)
      // add 5 hour (Eastern Time) + 24 hours
      if (!user.membershipExprireDate || (expireDate.getTime() + 29 * 60 * 60 * 1000) < now.getTime()) {
        return res.status(403).send({
          error: 'The login information was incorrect: Error 014'
        })
      }
      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        return res.status(403).send({
          error: 'The login information was incorrect: Error 012'
        })
      }
      if (user.Runner && user.Runner.name) {
        user.dataValues.name = user.Runner.name
        user.dataValues.Runner = null
      }
      const userJson = user.toJSON()
      res.send({
        user: userJson,
        token: jwtSignUser(userJson)
      })
    } catch (err) {
      console.log('returned err:' + JSON.stringify(err))
      return res.status(500).send({
        error: 'An error has occured trying to log in'
      })
    }
  }
}
