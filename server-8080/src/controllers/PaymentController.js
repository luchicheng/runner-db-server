// Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const Stripe = require('stripe')
const stripe = Stripe('sk_test_w1cfkNfiqguzNBdkatDX6gDY')
const forSaleService = [
  { invId: 1, name: 'Merchandise Payment', image: 'merchandise.jpg', description: '商品费用支付，如果不足请在购物车内更改数量。', category: 'Merch Goods', price: 10 },
  { invId: 2, name: 'Training Fee', image: 'fee.jpg', description: '训练费用支付，如果不足请在购物车内更改数量。', category: 'Service', price: 20 },
  { invId: 3, name: 'Membership Fee', image: 'fee.jpg', description: '会员费用支付，如果不足请在购物车内更改数量。', category: 'Service', price: 20 },
  { invId: 4, name: 'Donation', image: 'donation.jpg', description: '赞助费用支付，如果不足请在购物车内更改数量。', category: 'Donation', price: 100 },
  { invId: 5, name: 'Event Registration Fee', image: 'fee.jpg', description: '特殊会务费用支付，如果不足请在购物车内更改数量。', category: 'Service', price: 10 }
]
const {Payment} = require('../models')
const {User} = require('../models')

var self = module.exports = {
  async createCheckoutSession (req, res) {
    // console.log(req.body)
    const inCartItems = req.body.inCart
    const currentLocation = req.body.currentLocation
    const successLocation = req.body.successLocation
    let lineItems = []
    if (inCartItems && inCartItems.length > 0) {
      // start mapping inCartItem to LineItems for checkout Session
      lineItems = inCartItems.map(inCartItem => {
        let lineItem = {}
        let find = forSaleService.find(o => o.invId === inCartItem.invId)
        if (find) {
          lineItem.price_data = { currency: 'cad', product_data: { name: find.name }, unit_amount: find.price * 100 }
          lineItem.quantity = inCartItem.qty
          lineItem.description = inCartItem.comment
          return lineItem
        }
      })
    } else {
      return res.status(500).send({
        error: 'Your shopping cart is empty.'
      })
    }
    // console.log(req.user.dataValues.email2)
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: req.user.dataValues.email2,
        line_items: lineItems,
        // line_items: [
        //   {
        //     price_data: {
        //       currency: 'cad',
        //       product_data: {
        //         name: 'T-shirt'
        //       },
        //       unit_amount: 2000
        //     },
        //     quantity: 2
        //   },
        //   {
        //     price_data: {
        //       currency: 'cad',
        //       product_data: {
        //         name: 'T-shirt22'
        //       },
        //       unit_amount: 3000
        //     },
        //     quantity: 3
        //   }
        // ],
        mode: 'payment',
        success_url: successLocation,
        cancel_url: currentLocation
      })
      // console.log(session.payment_intent)
      let payments = []
      payments = lineItems.map(lineItem => {
        let payment = {}
        payment.UserId = req.user.dataValues.id
        payment.amount = (lineItem.price_data.unit_amount / 100) * lineItem.quantity
        payment.itemName = lineItem.price_data.product_data.name
        payment.itemQty = lineItem.quantity
        payment.itemPrice = lineItem.price_data.unit_amount / 100
        payment.chargeSuccessful = 'N'
        payment.fulfillSuccessful = 'N'
        payment.stripePi = session.payment_intent
        payment.comment = lineItem.description
        return payment
      })
      await self.insertOrUpdate(payments)

      res.send({ id: session.id })
    } catch (err) {
      console.log(err)
      return res.status(500).send({
        error: 'an error has occured trying to create checkout session.'
      })
    }
  },
  async markSuccessPaymentSession (req, res) {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id)
    // console.log(session)
    if (session && session.payment_intent && session.payment_status === 'paid') {
      var whereStatement = {}
      whereStatement.stripePi = session.payment_intent
      var payments = await Payment.findAll({
        where: whereStatement,
        limit: 50
      }).map(el => el.get({ plain: true }))
      await Promise.all(
        payments.map(async (payment) => {
          // console.log('update payment:', payment)
          if (payment.id) {
            payment.chargeSuccessful = 'Y'
            await Payment.update(payment, {
              where: {
                id: payment.id
              }
            })
            return payment
          }
        })
      )
    }
  },
  // insert DB a list of new payment entry
  async insertOrUpdate (payments) {
    // console.log('posting:' + payments)
    await Promise.all(
      payments.map(async (payment) => {
        // console.log('inserting/updating payment:', payment)
        if (payment.id) {
          await Payment.update(payment, {
            where: {
              id: payment.id
            }
          })
          return payment
        } else {
          const created = await Payment.create(payment)
          return created
        }
      })
    )
  },
  async post (req, res) {
    try {
      self.insertOrUpdate(req.body)
      return res.status(200).send({
        message: 'create/update the payment successfully.'
      })
    } catch (err) {
      console.log(err)
      return res.status(500).send({
        error: 'an error has occured trying to create/update the payment'
      })
    }
  },
  async index (req, res) {
    try {
      let payments = null
      // console.log('req.querye:', req.query)
      const search = req.query.search
      const paymentFilter = req.query.paymentFilter
      const userId = req.query.userId

      var whereStatement = {}
      // 'ALL' with userId empty: query all
      // 'ALL' with non-empty userId: query userId only
      // non-ALL: query UserId = paymentFilter only, ignore the value from userId
      if (paymentFilter !== 'ALL') {
        whereStatement.UserId = paymentFilter
      } else if (userId) {
        whereStatement.UserId = userId
      }
      if (search) {
        whereStatement.$or = [
          'itemName', 'comment', 'stripePi'
        ].map(key => ({
          [key]: {
            $like: `%${search}%`
          }
        }))
      }
      // console.log('where statte:', whereStatement)
      payments = await Payment.findAll({
        where: whereStatement,
        limit: 500,
        include: [
          {
            model: User
          }
        ]
      })
      payments.forEach((payment) => {
        if (payment.dataValues.User) {
          payment.dataValues.userName = payment.dataValues.User.email
        }
        payment.dataValues.User = null
      })
      // console.log('where payments:', payments)
      res.send(payments)
    } catch (err) {
      console.log(err)
      return res.status(500).send({
        error: 'an error has occured trying to fetch the payments'
      })
    }
  },
  async del (req, res) {
    try {
      const payment = await Payment.findById(req.params.paymentId)
      if (payment) {
        await Payment.destroy({
          where: {
            id: req.params.paymentId
          }
        })
      }
      res.send(payment)
    } catch (err) {
      return res.status(500).send({
        error: 'an error has occured trying to delete the payments'
      })
    }
  }
}
