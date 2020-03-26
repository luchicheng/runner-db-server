const {
  TrainingRecord,
  Runner
} = require('../models')
// const _ = require('lodash')
const RunnerDataHelper = require('../class/RunnerDataHelper')

module.exports = {
  async indexByRunnerRecently (req, res) {
    try {
      const runnerId = req.params.runnerId
      const search = req.query.search

      let whereCondition = {}
      if (runnerId) {
        whereCondition = {
          RunnerId: runnerId,
          currentPerf: 1
        }
      }
      // TODO search condisiton DateFrom and DateTo
      if (search) {
        const searchCondition = {
          $or: [
            'distance', 'comment'
          ].map(key => ({
            [key]: {
              $like: `%${search}%`
            }
          }))
        }
        whereCondition = Object.assign(whereCondition, searchCondition)
      }

      const data = await TrainingRecord.findAll({
        where: whereCondition,
        include: [
          {
            model: Runner
          }
        ],
        order: [
          ['date', 'DESC'],
          ['updatedAt', 'DESC']
        ]
      })
      data.map(d => {
        d.dataValues.pace = RunnerDataHelper.calPace(d.distance, d.time)
      })
      res.send(data)
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'an error has occured trying to fetch the trainingrecord'
      })
    }
  },
  async post (req, res) {
    try {
      const trainingrecord = await TrainingRecord.create(req.body)
      res.send(trainingrecord)
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'an error has occured trying to create the trainingrecord object'
      })
    }
  },
  // update records
  async put (req, res) {
    try {
      await TrainingRecord.update(req.body, {
        where: {
          id: req.params.trainingrecordId
        }
      })
      res.send(req.body)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to update the TrainingRecord'
      })
    }
  },

  async remove (req, res) {
    try {
      const trainingRecordId = req.params.trainingrecordId
      const data = await TrainingRecord.findOne({
        where: {
          id: trainingRecordId
        }
      })
      if (!data) {
        return res.status(403).send({
          error: 'you do not have access to this training record'
        })
      }
      await data.destroy()
      res.send(data)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to delete the training record'
      })
    }
  }
}
