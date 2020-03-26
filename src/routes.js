const AuthenticationController = require('./controllers/AuthenticationController')
const AuthenticationControllerPolicy = require('./policies/AuthenticationControllerPolicy')
const SongsController = require('./controllers/SongsController')
const BookmarksController = require('./controllers/BookmarksController')
const HistoriesController = require('./controllers/HistoriesController')
const RunnersController = require('./controllers/RunnersController')
const RacesController = require('./controllers/RacesController')
const TrainingRecordsController = require('./controllers/TrainingRecordsController')
const RaceRecordsController = require('./controllers/RaceRecordsController')
const DataQueryController = require('./controllers/DataQueryController')

const isAuthenticated = require('./policies/isAuthenticated')

module.exports = (app) => {
  app.post('/backapi/register',
    AuthenticationControllerPolicy.register,
    AuthenticationController.register)
  app.post('/backapi/login',
    AuthenticationController.login)

  app.get('/backapi/songs',
    SongsController.index)
  app.get('/backapi/songs/:songId',
    SongsController.show)
  app.put('/backapi/songs/:songId',
    SongsController.put)
  app.post('/backapi/songs',
    SongsController.post)

  app.get('/backapi/bookmarks',
    isAuthenticated,
    BookmarksController.index)
  app.post('/backapi/bookmarks',
    isAuthenticated,
    BookmarksController.post)
  app.delete('/backapi/backapi/bookmarks/:bookmarkId',
    isAuthenticated,
    BookmarksController.remove)

  app.get('/backapi/histories',
    isAuthenticated,
    HistoriesController.index)
  app.post('/backapi/histories',
    isAuthenticated,
    HistoriesController.post)

  app.get('/backapi/runners',
    // isAuthenticated,
    RunnersController.index)
  app.get('/backapi/runners/:runnerId',
    // isAuthenticated,
    RunnersController.show)
  app.get('/backapi/runners/extradata/:runnerId',
    // isAuthenticated,
    RunnersController.showExtraData)
  app.put('/backapi/runners/:runnerId',
    isAuthenticated,
    RunnersController.put)
  app.post('/backapi/runners',
    isAuthenticated,
    RunnersController.post)
  app.delete('/backapi/runners/:runnerId',
    isAuthenticated,
    RunnersController.del)

  app.get('/backapi/races',
    // isAuthenticated,
    RacesController.index)
  app.get('/backapi/racesObj',
    // isAuthenticated,
    RacesController.all_valid_objects)
  app.post('/backapi/races',
    isAuthenticated,
    RacesController.post)
  app.get('/backapi/validRaces',
    // isAuthenticated,
    RacesController.all_valid)
  app.delete('/races/:raceId',
    isAuthenticated,
    RacesController.del)

  // app.get('/trainingrecords',
  //   // isAuthenticated,
  //   TrainingRecordsController.index)
  app.post('/backapi/trainingrecords',
    // isAuthenticated,
    TrainingRecordsController.post)
  app.put('/backapi/trainingrecords/:trainingrecordId',
    // isAuthenticated,
    TrainingRecordsController.put)
  app.delete('/backapi/trainingrecords/:trainingrecordId',
    // isAuthenticated,
    TrainingRecordsController.remove)
  app.get('/backapi/runners/:runnerId/trainingrecords',
    // isAuthenticated,
    TrainingRecordsController.indexByRunnerRecently)

  // app.get('/racerecords',
  //   // isAuthenticated,
  //   RaceRecordsController.index)
  app.post('/backapi/racerecords',
    // isAuthenticated,
    RaceRecordsController.post)
  app.put('/backapi/racerecords/:racerecordId',
    // isAuthenticated,
    RaceRecordsController.put)
  app.delete('/backapi/racerecords/:racerecordId',
    // isAuthenticated,
    RaceRecordsController.remove)
  app.get('/backapi/runners/:runnerId/racerecords',
    // isAuthenticated,
    RaceRecordsController.indexByRunner)

  app.get('/backapi/data/trainingrecords',
    // isAuthenticated,
    DataQueryController.queryTrainingRecords)
  app.get('/backapi/data/racerecords',
    // isAuthenticated,
    DataQueryController.queryRaceRecords)
  app.get('/backapi/data/topracerecords',
    // isAuthenticated,
    DataQueryController.queryTopRaceRecords)
}
