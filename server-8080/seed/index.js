const {
  sequelize,
  Song,
  Runner,
  User,
  Bookmark,
  History,
  Race,
  TrainingRecord,
  RaceRecord,
  Album,
  Photo
} = require('../src/models')

const Promise = require('bluebird')
const songs = require('./songs.json')
const runners = require('./runners.json')
const users = require('./users.json')
const bookmarks = require('./bookmarks.json')
const histories = require('./histories.json')
const races = require('./races.json')
const trainingRecords = require('./trainingRecords.json')
const raceRecords = require('./raceRecords.json')
const photo = require('./photo.json')
const album = require('./album.json')

sequelize.sync({ force: true })
  .then(async function () {
    await Promise.all(
      users.map(user => {
        User.create(user)
      })
    )

    await Promise.all(
      songs.map(song => {
        Song.create(song)
      })
    )

    await Promise.all(
      bookmarks.map(bookmark => {
        Bookmark.create(bookmark)
      })
    )

    await Promise.all(
      histories.map(history => {
        History.create(history)
      })
    )

    await Promise.all(
      races.map(race => {
        Race.create(race)
      })
    )

    await Promise.all(
      runners.map(runner => {
        Runner.create(runner)
      })
    )

    await Promise.all(
      trainingRecords.map(tr => {
        TrainingRecord.create(tr)
      })
    )

    await Promise.all(
      raceRecords.map(tr => {
        RaceRecord.create(tr)
      })
    )

    await Promise.all(
      album.map(tr => {
        Album.create(tr)
      })
    )

    await Promise.all(
      photo.map(tr => {
        Photo.create(tr)
      })
    )
  })
