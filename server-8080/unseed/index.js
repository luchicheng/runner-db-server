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
const fs = require('fs')
const path = require('path')
const config = require('../src/config/config')

const Promise = require('bluebird')
const today = new Date().toISOString().slice(0, 10)

fs.mkdir(path.join(config.db.backup_folder, today), { recursive: true }, (err) => {
  if (err) throw err;
});

const unseed = function (module) {
  console.log('reading data from DB table:', module.name.toLowerCase())
  module.findAll()
    .map(el => el.get({ plain: true }))
    .then((result) => {      
      const f = path.join(config.db.backup_folder, today, module.name.toLowerCase() + '.json')
      console.log('writting data into file:', f)
      fs.writeFile(f,
        JSON.stringify(result, null, 4), (err) => {
          if (err) throw err;
          console.log('The file has been saved!')
        })
    })
}
unseed(Album)
unseed(Photo)
unseed(Race)
unseed(RaceRecord)
unseed(Runner)
unseed(TrainingRecord)
unseed(User)


// console.log('DONE!')
