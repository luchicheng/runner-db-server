const {
  RaceRecord,
  Runner,
  Race
} = require('../models')
// const _ = require('lodash')
const RunnerDataHelper = require('../class/RunnerDataHelper')

module.exports = {
  async indexByRunner (req, res) {
    try {
      const runnerId = req.params.runnerId
      // raceInfo for record match RaceComment/Name/Desc
      const raceInfo = req.query.raceInfo
      // raceRecordInfo for record match Comment
      const raceRecordInfo = req.query.raceRecordInfo
      // const distance = req.query.distance

      let whereConditionRace = {}
      let whereConditionRR = {}
      if (runnerId) {
        whereConditionRR = {
          RunnerId: runnerId
        }
      }
      // TODO search condisiton DateFrom and DateTo
      if (raceRecordInfo) {
        whereConditionRR.comment = {
          $like: `%${raceRecordInfo}%`
        }
      }
      if (raceInfo) {
        const searchCondition = {
          $or: [
            'name', 'desc', 'comment'
          ].map(key => ({
            [key]: {
              $like: `%${raceInfo}%`
            }
          }))
        }
        whereConditionRace = Object.assign(whereConditionRace, searchCondition)
      }

      const data = await RaceRecord.findAll({
        where: whereConditionRR,
        include: [
          {
            model: Runner
          },
          {
            model: Race,
            where: whereConditionRace
          }
        ],
        order: [
          // TODO debug while this ordering doesn't work
          // [{'Race', 'dor'}, 'DESC'],
          ['updatedAt', 'DESC']
        ]
      })
        .map(el => el.get({ plain: true })) // add this line to code
      data.map(rr => {
        rr.pace = RunnerDataHelper.calPace(rr.Race.distance, rr.time)
        if (rr.Race) {
          rr.raceName = rr.Race.name
          rr.distance = rr.Race.distance
          rr.date = rr.Race.dor
        }
      })
      res.send(data)
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'an error has occured trying to fetch the race record'
      })
    }
  },
  // create new
  async post (req, res) {
    try {
      const racerecord = await RaceRecord.create(req.body)
      res.send(racerecord)
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'an error has occured trying to create the race record object'
      })
    }
  },
  // update records
  async put (req, res) {
    try {
      await RaceRecord.update(req.body, {
        where: {
          id: req.params.racerecordId
        }
      })
      res.send(req.body)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to update the RaceRecord'
      })
    }
  },

  async remove (req, res) {
    try {
      const raceRecordId = req.params.racerecordId
      const data = await RaceRecord.findOne({
        where: {
          id: raceRecordId
        }
      })
      if (!data) {
        return res.status(403).send({
          error: 'you do not have access to this race record'
        })
      }
      await data.destroy()
      res.send(data)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to delete the race record'
      })
    }
  }
}
