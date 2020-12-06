const {User} = require('../models')
const {Runner} = require('../models')

module.exports = {
  async index (req, res) {
    try {
      let users = null
      const search = req.query.search
      if (search) {
        users = await User.findAll({
          attributes: { exclude: ['password'] },
          where: {
            $or: [
              'email', 'comment'
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
          .map(el => el.get({ plain: true })) // add this line to code
          // TODO const sequelize = new Sequelize('connectionUri', { define: { raw: true } });
      } else {
        users = await User.findAll({
          attributes: { exclude: ['password'] },
          limit: 500,
          include: [
            {
              model: Runner
            }
          ]
        })
          .map(el => el.get({ plain: true })) // add this line to code
      }
      // console.log(users)
      res.send(users)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to fetch the users'
      })
    }
  },
  async post (req, res) {
    try {
      console.log('user id.....', req.body.id)
      if (req.body.id) {
        await User.update(req.body, {
          where: {
            id: req.body.id
          }
        })
      } else {
        const exstingUser = await User.findOne({
          where: {
            email: req.body.email
          }
        })
        if (exstingUser) {
          res.status(500).send({
            error: 'this ID is existed, new member creation failed.'
          })
          return
        }
        req.body.password = '12345678'
        const user = await User.create(req.body)
        res.send(user)
      }
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'an error has occured trying to create/update the user'
      })
    }
  },
  async del (req, res) {
    console.log('user id.....', req.params)
    try {
      console.log('user id.....', req.params)
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
        error: 'an error has occured trying to delete the users'
      })
    }
  }
}
