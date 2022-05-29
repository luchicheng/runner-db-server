const {
  TrainingRecord,
  RaceRecord,
  Runner,
  Race
} = require('../models')
// const _ = require('lodash')
const RunnerDataHelper = require('../class/RunnerDataHelper')

module.exports = {
  async queryTrainingRecords (req, res) {
    try {
      const runnerIds = req.query.runnerIds
      const raceIds = req.query.raceIds
      const recentYear = req.query.recentYear

      let whereConditionRunner = {}
      if (typeof runnerIds !== 'undefined') {
        whereConditionRunner.id = runnerIds
      }
      if (typeof raceIds !== 'undefined') {
        whereConditionRunner.RaceId = raceIds
      }
      let runners = await Runner.findAll({
        where: whereConditionRunner,
        include: [
          {
            model: Race
          }
        ]
      })
        .map(el => el.get({ plain: true })) // add this line to code
      let runnerData = []
      const ONE_YEAR_AGO = new Date(new Date().getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      await Promise.all(
        runners
          .map(async (r) => {
          // for each runner.id&distance, get best/min time
            let whereConditionTR = {}
            if (typeof recentYear !== 'undefined') {
              whereConditionTR.date = {
                gt: ONE_YEAR_AGO
              }
            }
            whereConditionTR.RunnerId = r.id
            const oneRunnerTrainData = await TrainingRecord.findAll({
              attributes: [
                'distance',
                [TrainingRecord.sequelize.fn('min',
                  TrainingRecord.sequelize.col('time')), 'time']],
              where: whereConditionTR,
              order: [
                ['date', 'DESC'],
                ['updatedAt', 'DESC']
              ],
              group: [ 'distance' ]
            })
              .map(el => el.get({ plain: true })) // add this line to code
            oneRunnerTrainData.map(ortd => {
              r[ortd.distance + 'TIME'] = ortd.time
              r[ortd.distance + 'PACE'] = RunnerDataHelper.calPace(ortd.distance, ortd.time)
            })
            r.ageGroup = RunnerDataHelper.getAgeGroup(r.dob)
            r.bqTime = RunnerDataHelper.getNextBqTime(r.dob, r.gender)
            if (r.Race !== null) {
              r.raceName = r.Race.name
            }
            runnerData.push(Object.assign({}, r))
          })
      )
      res.send(runnerData)
    } catch (err) {
      console.log(err)
      return res.status(500).send({
        error: 'an error has occured trying to fetch the training record'
      })
    }
  },
  async queryRaceRecords (req, res) {
    try {
      const runnerIds = req.query.runnerIds
      const raceIds = req.query.raceIds
      const recentYear = req.query.recentYear

      let whereConditionRunner = {}
      if (typeof runnerIds !== 'undefined') {
        whereConditionRunner.id = runnerIds
      }
      let whereConditionRace = {}
      if (typeof raceIds !== 'undefined') {
        whereConditionRace.id = raceIds
      }
      const ONE_YEAR_AGO = new Date(new Date().getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      if (typeof recentYear !== 'undefined') {
        whereConditionRace.dor = {
          gt: ONE_YEAR_AGO
        }
      }

      let raceRecordData = await RaceRecord.findAll({
        include: [
          {
            model: Runner,
            where: whereConditionRunner
          },
          {
            model: Race,
            where: whereConditionRace
          }
        ]
      }).map(el => el.get({ plain: true }))
      raceRecordData.map(rrd => {
        if (rrd.Runner !== null) {
          rrd.runnerName = rrd.Runner.name
          rrd.nickName = rrd.Runner.nickName
          rrd.ageGroup = RunnerDataHelper.getAgeGroup(rrd.Runner.dob)
          rrd.bqTime = RunnerDataHelper.getNextBqTime(rrd.Runner.dob, rrd.Runner.gender)
        }
        if (rrd.Race !== null) {
          rrd.raceName = rrd.Race.name
          rrd.raceTime = rrd.Race.dor
        }
        rrd.bqFlag = (rrd.bqTime >= rrd.time)
        rrd.Runner = null
        rrd.Race = null
      })

      res.send(raceRecordData)
    } catch (err) {
      console.log(err)
      return res.status(500).send({
        error: 'an error has occured trying to fetch the race record'
      })
    }
  },
  async queryTopRaceRecords (req, res) {
    try {
      const year = req.query.year
      const number = req.query.number
      const gender = req.query.gender
      let whereConditionRunner = {}
      if (typeof gender !== 'undefined') {
        whereConditionRunner.gender = gender
      } else {
        console.log('gender is mandatory to fetch the top race record')
        return res.status(500).send({
          error: 'an error has occured trying to fetch the top race record'
        })
      }
      let whereConditionRace = {
        distance: '42.2K'
      }
      if (typeof year !== 'undefined') {
        const date1 = year + '-01-01'
        const date2 = year + '-12-31'
        whereConditionRace.dor = {
          $lte: date2,
          $gte: date1
        }
      }

      let raceRecordData = await RaceRecord.findAll({
        attributes: [
          'RunnerId',
          'RaceId',
          [TrainingRecord.sequelize.fn('min',
            TrainingRecord.sequelize.col('time')), 'time']],
        include: [
          {
            model: Runner,
            where: whereConditionRunner
          },
          {
            model: Race,
            where: whereConditionRace
          }
        ],
        order: [
          ['time', 'ASC'],
          ['updatedAt', 'DESC']
        ],
        group: [ 'RunnerId' ],
        limit: number
      }).map(el => el.get({ plain: true }))
      raceRecordData.map(rrd => {
        if (rrd.Runner !== null) {
          rrd.runnerName = rrd.Runner.name
          rrd.nickName = rrd.Runner.nickName
          rrd.ageGroup = RunnerDataHelper.getAgeGroup(rrd.Runner.dob)
          rrd.bqTime = RunnerDataHelper.getNextBqTime(rrd.Runner.dob, rrd.Runner.gender)
        }
        if (rrd.Race !== null) {
          rrd.raceName = rrd.Race.name
          rrd.raceTime = rrd.Race.dor
        }
        rrd.bqFlag = (rrd.bqTime >= rrd.time)
        rrd.Runner = null
        rrd.Race = null
      })
      for (var i = 0; i < number; i++) {
        if (typeof raceRecordData[i] !== 'undefined') {
          raceRecordData[i].index = i + 1
        } else {
          // raceRecordData[i] = { index: i + 1 }
        }
      }
      // console.log('returned top data:' + JSON.stringify(raceRecordData))
      res.send(raceRecordData)
    } catch (err) {
      console.log(err)
      return res.status(500).send({
        error: 'an error has occured trying to fetch the top race record'
      })
    }
  }
}
