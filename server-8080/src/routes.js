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
const PhotosController = require('./controllers/PhotosController')
const AlbumsController = require('./controllers/AlbumsController')
const UsersController = require('./controllers/UsersController')
const PaymentController = require('./controllers/PaymentController')
const EmailSendingRequestsController = require('./controllers/EmailSendingRequestsController')

const isAuthenticated = require('./policies/isAuthenticated')
const { fetchAndQueueAdminEmails } = require('./controllers/FetchAndQueueAdminEmailsController')

const { start, stop, sendEmailJobOnce } = require('./jobs/emailJobScheduler')
const { logger } = require('./utils/logger') || console

module.exports = (app) => {
  app.post('/backapi/register',
    AuthenticationControllerPolicy.register,
    AuthenticationController.register)
  app.post('/backapi/login',
    AuthenticationController.login)
  app.post('/backapi/passwordReset',
    isAuthenticated,
    AuthenticationController.passwordReset)

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
  app.delete('/backapi/bookmarks/:bookmarkId',
    isAuthenticated,
    BookmarksController.remove)

  app.get('/backapi/histories',
    isAuthenticated,
    HistoriesController.index)
  app.post('/backapi/histories',
    isAuthenticated,
    HistoriesController.post)

  app.get('/backapi/runners',
    isAuthenticated,
    RunnersController.index)
  app.get('/backapi/runners/:runnerId',
    isAuthenticated,
    RunnersController.show)
  app.get('/backapi/runners/extradata/:runnerId',
    isAuthenticated,
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
    isAuthenticated,
    RacesController.index)
  app.get('/backapi/racesObj',
    isAuthenticated,
    RacesController.all_valid_objects)
  app.post('/backapi/races',
    isAuthenticated,
    RacesController.post)
  app.get('/backapi/validRaces',
    isAuthenticated,
    RacesController.all_valid)
  app.delete('/backapi/races/:raceId',
    isAuthenticated,
    RacesController.del)
  app.post('/backapi/trainingrecords',
    isAuthenticated,
    TrainingRecordsController.post)
  app.put('/backapi/trainingrecords/:trainingrecordId',
    isAuthenticated,
    TrainingRecordsController.put)
  app.delete('/backapi/trainingrecords/:trainingrecordId',
    isAuthenticated,
    TrainingRecordsController.remove)
  app.get('/backapi/runners/:runnerId/trainingrecords',
    isAuthenticated,
    TrainingRecordsController.indexByRunnerRecently)

  app.post('/backapi/racerecords',
    isAuthenticated,
    RaceRecordsController.post)
  app.put('/backapi/racerecords/:racerecordId',
    isAuthenticated,
    RaceRecordsController.put)
  app.delete('/backapi/racerecords/:racerecordId',
    isAuthenticated,
    RaceRecordsController.remove)
  app.get('/backapi/runners/:runnerId/racerecords',
    isAuthenticated,
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

  app.post('/backapi/importPhotos',
    // isAuthenticated,
    PhotosController.importPhotos)

  app.get('/backapi/albums',
    // isAuthenticated,
    AlbumsController.index)
  app.post('/backapi/albums',
    // isAuthenticated,
    AlbumsController.post)
  app.delete('/backapi/albums/:albumId',
    // isAuthenticated,
    AlbumsController.del)
  app.get('/backapi/albums/:albumId/photos',
    // isAuthenticated,
    AlbumsController.indexPhotos)
  app.get('/backapi/users',
    isAuthenticated,
    UsersController.index)
  app.post('/backapi/users',
    isAuthenticated,
    UsersController.post)
  app.delete('/backapi/users/:userId',
    isAuthenticated,
    UsersController.del)
  app.post('/backapi/payment/checkout',
    isAuthenticated,
    PaymentController.createCheckoutSession)
  app.get('/backapi/payment/success',
    isAuthenticated,
    PaymentController.markSuccessPaymentSession)
  app.get('/backapi/payments',
    isAuthenticated,
    PaymentController.index)
  app.post('/backapi/payments',
    isAuthenticated,
    PaymentController.post)
  app.delete('/backapi/payments/:paymentId',
    isAuthenticated,
    PaymentController.del)
  app.get('/backapi/emailrequests',
    isAuthenticated,
    EmailSendingRequestsController.index)
  app.get('/backapi/emailrequests/:emailRequestId',
    isAuthenticated,
    EmailSendingRequestsController.show)
  app.post('/backapi/emailrequests',
    isAuthenticated,
    EmailSendingRequestsController.post)
  app.put('/backapi/emailrequests/:emailRequestId',
    isAuthenticated,
    EmailSendingRequestsController.put)
  app.delete('/backapi/emailrequests/:emailRequestId',
    isAuthenticated,
    EmailSendingRequestsController.del)
  app.post('/backapi/email/fetch',
    isAuthenticated, async (req, res) => {
      try {
        const result = await fetchAndQueueAdminEmails()
        return res.json({ ok: true, queued: result })
      } catch (err) {
        console.error('Error fetching admin emails:', err)
        return res.status(500).json({ ok: false, error: err.message || String(err) })
      }
    })
  app.post('/backapi/email/sendOnce', isAuthenticated, async (req, res) => {
    try {
      logger.info('Manual trigger: /backapi/email/sendOnce')
      await sendEmailJobOnce()
      return res.json({ ok: true, message: 'sendEmailJobOnce invoked' })
    } catch (err) {
      logger.error('Error invoking sendEmailJobOnce', err)
      return res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) })
    }
  })
  app.post('/backapi/emailJob/start', isAuthenticated, async (req, res) => {
    try {
      logger.info('Manual trigger: /backapi/emailJob/start')
      await start()
      return res.json({ ok: true, message: 'Email sending job started' })
    } catch (err) {
      logger.error('Error invoking Email job started', err)
      return res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) })
    }
  })
  app.post('/backapi/emailJob/stop', isAuthenticated, async (req, res) => {
    try {
      logger.info('Manual trigger: /backapi/emailJob/stop')
      await stop()
      return res.json({ ok: true, message: 'Email job stopped' })
    } catch (err) {
      logger.error('Error invoking Email sending job stopped', err)
      return res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) })
    }
  })
}
