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
      const user = await User.create(req.body)
      const userJson = user.toJSON()
      res.send({
        user: userJson,
        token: jwtSignUser(userJson)
      })
    } catch (err) {
      res.status(400).send({
        error: 'This email account is already in use.'
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
      res.status(500).send({
        error: 'An error has occured trying to log in'
      })
    }
  }
}
