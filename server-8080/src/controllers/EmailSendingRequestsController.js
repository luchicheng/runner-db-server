const {EmailSendingRequest, Email} = require('../models')
const { Op } = require('sequelize')

module.exports = {
  async index (req, res) {
    try {
      let emailSendingRequests = null
      const search = req.query.search
      const statusFilter = req.query.statusFilter
      const dateFrom = req.query.dateFrom
      const dateTo = req.query.dateTo
      const generatedDateFrom = req.query.generatedDateFrom
      const generatedDateTo = req.query.generatedDateTo

      console.log(req.query)
      console.log(statusFilter)
      var whereStatement = {}

      if (statusFilter && statusFilter !== 'ALL') {
        whereStatement.status = statusFilter
      }

      // Date range filter
      if (dateFrom || dateTo) {
        whereStatement.sentDate = {}

        if (dateFrom) {
          whereStatement.sentDate[Op.gte] = new Date(dateFrom)
        }

        if (dateTo) {
          whereStatement.sentDate[Op.lte] = new Date(dateTo)
        }
      }

      // generatedDate filter
      if (generatedDateFrom || generatedDateTo) {
        whereStatement.createdAt = {}

        if (generatedDateFrom) {
          whereStatement.createdAt[Op.gte] = new Date(generatedDateFrom)
        }

        if (generatedDateTo) {
          whereStatement.createdAt[Op.lte] = new Date(generatedDateTo)
        }
      }

      if (search) {
        whereStatement.$or = [
          'emailToAddress'
        ].map(key => ({
          [key]: {
            $like: `%${search}%`
          }
        }))
      }

      console.log('where statte:', whereStatement)

      emailSendingRequests = await EmailSendingRequest.findAll({
        where: whereStatement,
        limit: 500,
        include: [
          {
            model: Email
          }
        ]
      })
      res.send(emailSendingRequests)
    } catch (err) {
      console.log(err)
      return res.status(500).send({
        error: 'an error has occured trying to fetch the email sending requests'
      })
    }
  },
  async show (req, res) {
    try {
      const emailSendingRequest = await EmailSendingRequest.findOne({
        where: {
          id: req.params.emailSendingRequestId
        },
        include: [
          {
            model: Email
          }
        ]
      })
      res.send(emailSendingRequest)
    } catch (err) {
      return res.status(500).send({
        error: 'an error has occured trying to show the email sending request'
      })
    }
  },
  // create new email sending request
  async post (req, res) {
    try {
      if (req.body.id) {
        await EmailSendingRequest.update(req.body, {
          where: {
            id: req.body.id
          }
        })
        res.send(req.body)
      } else {
        const emailSendingRequest = await EmailSendingRequest.create(req.body)
        res.send(emailSendingRequest)
      }
    } catch (err) {
      return res.status(500).send({
        error: 'an error has occured trying to create/update the email sending request'
      })
    }
  },
  async put (req, res) {
    try {
      await EmailSendingRequest.update(req.body, {
        where: {
          id: req.params.emailSendingRequestId
        }
      })
      res.send(req.body)
    } catch (err) {
      return res.status(500).send({
        error: 'an error has occured trying to update the email sending request'
      })
    }
  },
  async del (req, res) {
    try {
      console.log('Deleting email sending request id:', JSON.stringify(req.params))
      const emailSendingRequest = await EmailSendingRequest.findById(req.params.emailRequestId)
      if (emailSendingRequest) {
        await EmailSendingRequest.destroy({
          where: {
            id: req.params.emailRequestId
          }
        })
      }
      res.send(emailSendingRequest)
    } catch (err) {
      return res.status(500).send({
        error: 'an error has occured trying to delete the email sending request'
      })
    }
  }
}
