module.exports = (sequelize, DataTypes) => {
  const EmailSendingRequest = sequelize.define('EmailSendingRequest', {
    emailToAddress: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('pending', 'canceled', 'sent', 'failed'),
      allowNull: false,
      defaultValue: 'pending'
    },
    sentDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  })

  EmailSendingRequest.associate = function (models) {
    EmailSendingRequest.belongsTo(models.Email, { constraints: true,
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
      foreignKey: {
        name: 'EmailId',
        allowNull: false
      } })
  }

  return EmailSendingRequest
}
