const {User, Runner} = require('../models')

module.exports = {
  async index (req, res) {
    try {
      let users = null
      const search = req.query.search

      if (search) {
        users = await User.findAll({
          where: {
            $or: [
              'name', 'nickName', 'phone', 'ePhone', 'comment'
            ].map(key => ({
              [key]: {
                $like: `%${search}%`
              }
            }))
          },
          include: [
            {
              model: Runner
            }
          ]
        })
      } else {
        users = await User.findAll({
          limit: 100,
          include: [
            {
              model: Runner
            }
          ]
        })
      }
      res.send(users)
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'an error has occured trying to fetch the users'
      })
    }
  },
  async show (req, res) {
    try {
      const user = await User.findOne({
        where: {
          id: req.params.userId
        },
        include: [
          {
            model: Runner
          }
        ]
      })
      res.send(user)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to show the users'
      })
    }
  },
  async showExtraData (req, res) {
    try {
      const user = await User.findOne({
        where: {
          id: req.params.userId
        },
        include: [
          {
            model: Runner
          }
        ]
      })
      res.send(user)
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'an error has occured trying to show the Users'
      })
    }
  },
  // create new runner
  async post (req, res) {
    try {
      if (req.body.id) {
        await User.update(req.body, {
          where: {
            id: req.body.id
          }
        })
      } else {
        const user = await User.create(req.body)
        res.send(user)
      }
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to create/update the user'
      })
    }
  },
  async put (req, res) {
    try {
      await User.update(req.body, {
        where: {
          id: req.params.userId
        }
      })
      res.send(req.body)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to update the user'
      })
    }
  },
  async del (req, res) {
    try {
      const user = await User.findById(req.params.userId)
      if (user) {
        await User.destroy({
          where: {
            id: req.params.userId
          }
        })
      }
      res.send(user)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to show the users'
      })
    }
  }
}
