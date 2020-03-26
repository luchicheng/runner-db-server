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
  app.post('/register',
    AuthenticationControllerPolicy.register,
    AuthenticationController.register)
  app.post('/login',
    AuthenticationController.login)

  app.get('/songs',
    SongsController.index)
  app.get('/songs/:songId',
    SongsController.show)
  app.put('/songs/:songId',
    SongsController.put)
  app.post('/songs',
    SongsController.post)

  app.get('/bookmarks',
    isAuthenticated,
    BookmarksController.index)
  app.post('/bookmarks',
    isAuthenticated,
    BookmarksController.post)
  app.delete('/bookmarks/:bookmarkId',
    isAuthenticated,
    BookmarksController.remove)

  app.get('/histories',
    isAuthenticated,
    HistoriesController.index)
  app.post('/histories',
    isAuthenticated,
    HistoriesController.post)

  app.get('/runners',
    // isAuthenticated,
    RunnersController.index)
  app.get('/runners/:runnerId',
    // isAuthenticated,
    RunnersController.show)
  app.get('/runners/extradata/:runnerId',
    // isAuthenticated,
    RunnersController.showExtraData)
  app.put('/runners/:runnerId',
    isAuthenticated,
    RunnersController.put)
  app.post('/runners',
    isAuthenticated,
    RunnersController.post)
  app.delete('/runners/:runnerId',
    isAuthenticated,
    RunnersController.del)

  app.get('/races',
    // isAuthenticated,
    RacesController.index)
  app.get('/racesObj',
    // isAuthenticated,
    RacesController.all_valid_objects)
  app.post('/races',
    isAuthenticated,
    RacesController.post)
  app.get('/validRaces',
    // isAuthenticated,
    RacesController.all_valid)
  app.delete('/races/:raceId',
    isAuthenticated,
    RacesController.del)

  // app.get('/trainingrecords',
  //   // isAuthenticated,
  //   TrainingRecordsController.index)
  app.post('/trainingrecords',
    // isAuthenticated,
    TrainingRecordsController.post)
  app.put('/trainingrecords/:trainingrecordId',
    // isAuthenticated,
    TrainingRecordsController.put)
  app.delete('/trainingrecords/:trainingrecordId',
    // isAuthenticated,
    TrainingRecordsController.remove)
  app.get('/runners/:runnerId/trainingrecords',
    // isAuthenticated,
    TrainingRecordsController.indexByRunnerRecently)

  // app.get('/racerecords',
  //   // isAuthenticated,
  //   RaceRecordsController.index)
  app.post('/racerecords',
    // isAuthenticated,
    RaceRecordsController.post)
  app.put('/racerecords/:racerecordId',
    // isAuthenticated,
    RaceRecordsController.put)
  app.delete('/racerecords/:racerecordId',
    // isAuthenticated,
    RaceRecordsController.remove)
  app.get('/runners/:runnerId/racerecords',
    // isAuthenticated,
    RaceRecordsController.indexByRunner)

  app.get('/data/trainingrecords',
    // isAuthenticated,
    DataQueryController.queryTrainingRecords)
  app.get('/data/racerecords',
    // isAuthenticated,
    DataQueryController.queryRaceRecords)
  app.get('/data/topracerecords',
    // isAuthenticated,
    DataQueryController.queryTopRaceRecords)
}
