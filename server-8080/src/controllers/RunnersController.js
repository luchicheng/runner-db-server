const {Runner, Race} = require('../models')
const RunnerDataHelper = require('../class/RunnerDataHelper')

module.exports = {
  async index (req, res) {
    try {
      let runners = null
      const search = req.query.search
      const runnerFilter = req.query.runnerFilter

      var whereStatement = {}

      if (runnerFilter !== 'ALL') {
        whereStatement.id = runnerFilter
      }
      if (search) {
        whereStatement.$or = [
          'name', 'nickName', 'phone', 'ePhone', 'comment'
        ].map(key => ({
          [key]: {
            $like: `%${search}%`
          }
        }))
      }

      runners = await Runner.findAll({
        where: whereStatement,
        limit: 500,
        include: [
          {
            model: Race
          }
        ]
      })
      // }
      res.send(runners)
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'an error has occured trying to fetch the runners'
      })
    }
  },
  async show (req, res) {
    try {
      // const runner = await Runner.findById(req.params.runnerId)
      const runner = await Runner.findOne({
        where: {
          id: req.params.runnerId
        },
        include: [
          {
            model: Race
          }
        ]
      })
      res.send(runner)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to show the runners'
      })
    }
  },
  async showExtraData (req, res) {
    try {
      // const runner = await Runner.findById(req.params.runnerId)
      const runner = await Runner.findOne({
        where: {
          id: req.params.runnerId
        },
        include: [
          {
            model: Race
          }
        ]
      })
      refreshExtraData(runner.dataValues)
      if (runner.Race) {
        runner.dataValues.raceName = runner.Race.name
      }
      res.send(runner)
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'an error has occured trying to show the runners'
      })
    }
  },
  // create new runner
  async post (req, res) {
    try {
      if (req.body.id) {
        await Runner.update(req.body, {
          where: {
            id: req.body.id
          }
        })
      } else {
        const runner = await Runner.create(req.body)
        res.send(runner)
      }
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to create/update the runner'
      })
    }
  },
  async put (req, res) {
    try {
      await Runner.update(req.body, {
        where: {
          id: req.params.runnerId
        }
      })
      res.send(req.body)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to update the runner'
      })
    }
  },
  async del (req, res) {
    try {
      const runner = await Runner.findById(req.params.runnerId)
      if (runner) {
        await Runner.destroy({
          where: {
            id: req.params.runnerId
          }
        })
      }
      res.send(runner)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to show the runners'
      })
    }
  }
}

function refreshExtraData (data) {
  data.ageGroup = RunnerDataHelper.getAgeGroup(data.dob)
  data.bqTime = RunnerDataHelper.getNextBqTime(data.dob, data.gender)
  data.bqDate = RunnerDataHelper.getNextBqDate()
}
