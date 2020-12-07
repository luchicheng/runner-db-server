const {Race} = require('../models')

module.exports = {
  async index (req, res) {
    try {
      let races = null
      const search = req.query.search
      if (search) {
        races = await Race.findAll({
          where: {
            $or: [
              'name', 'desc', 'comment'
            ].map(key => ({
              [key]: {
                $like: `%${search}%`
              }
            }))
          }
        })
          .map(el => el.get({ plain: true })) // add this line to code
          // TODO const sequelize = new Sequelize('connectionUri', { define: { raw: true } });
      } else {
        races = await Race.findAll({
          limit: 500
        })
          .map(el => el.get({ plain: true })) // add this line to code
      }
      // console.log(races)
      res.send(races)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to fetch the races'
      })
    }
  },
  // get all races, how do we filter old races?
  async all_valid (req, res) {
    try {
      let races = await Race.findAll()
      res.send(races)
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'an error has occured trying to fetch all available races'
      })
    }
  },
  // get available races, text and object pair
  async all_valid_objects (req, res) {
    try {
      let races = await Race.findAll().map(el => el.get({ plain: true }))
      var result = []
      races.map(d => {
        result.push({ 'text': d.name, 'value': d })
      })

      res.send(result)
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'an error has occured trying to fetch all available races'
      })
    }
  },
  async post (req, res) {
    try {
      // console.log('race id.....', req.body.id)
      if (req.body.id) {
        await Race.update(req.body, {
          where: {
            id: req.body.id
          }
        })
        res.send(req.body)
      } else {
        const race = await Race.create(req.body)
        res.send(race)
      }
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'an error has occured trying to create/update the race'
      })
    }
  },
  async del (req, res) {
    try {
      const race = await Race.findById(req.params.raceId)
      if (race) {
        await Race.destroy({
          where: {
            id: req.params.raceId
          }
        })
      }
      res.send(race)
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'an error has occured trying to show the races'
      })
    }
  }
}
