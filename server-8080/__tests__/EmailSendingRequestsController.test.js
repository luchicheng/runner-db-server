const {Op} = require('sequelize')

jest.mock('../src/models', () => {
  const {Op} = require('sequelize')
  return {
    EmailSendingRequest: {
      findAll: jest.fn()
    },
    Email: {},
    // expose Op if any consumer reuses it from the models mock
    Op
  }
})

const {EmailSendingRequest, Email} = require('../src/models')
const controller = require('../src/controllers/EmailSendingRequestsController')

describe('EmailSendingRequestsController.index', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('builds filters from query params and returns results', async () => {
    const req = {
      query: {
        search: 'abc',
        statusFilter: 'PENDING',
        dateFrom: '2024-01-01',
        dateTo: '2024-01-02',
        generatedDateFrom: '2024-01-03',
        generatedDateTo: '2024-01-04'
      }
    }
    const send = jest.fn()
    const res = { send }
    const mockResults = [{ id: 1 }]
    EmailSendingRequest.findAll.mockResolvedValue(mockResults)

    await controller.index(req, res)

    expect(EmailSendingRequest.findAll).toHaveBeenCalledTimes(1)
    const callArg = EmailSendingRequest.findAll.mock.calls[0][0]

    expect(callArg.limit).toBe(500)
    expect(callArg.include).toEqual([{ model: Email }])
    expect(callArg.where).toEqual({
      status: 'PENDING',
      sentDate: {
        [Op.gte]: new Date('2024-01-01'),
        [Op.lte]: new Date('2024-01-02')
      },
      createdAt: {
        [Op.gte]: new Date('2024-01-03'),
        [Op.lte]: new Date('2024-01-04')
      },
      $or: [
        {
          emailToAddress: {
            $like: '%abc%'
          }
        }
      ]
    })

    expect(send).toHaveBeenCalledWith(mockResults)
  })
})
