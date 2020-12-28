module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    amount: DataTypes.INTEGER,
    itemName: DataTypes.STRING,
    itemQty: DataTypes.INTEGER,
    itemPrice: DataTypes.INTEGER,
    chargeSuccessful: DataTypes.STRING,
    fulfillSuccessful: DataTypes.STRING,
    stripePi: DataTypes.STRING,
    comment: DataTypes.STRING
  })

  Payment.associate = function (models) {
    Payment.belongsTo(models.User)
  }

  return Payment
}
