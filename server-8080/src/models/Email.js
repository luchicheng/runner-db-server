module.exports = (sequelize, DataTypes) => {
  const Email = sequelize.define('Email', {
    subject: DataTypes.STRING,
    body: DataTypes.STRING,
    html: DataTypes.STRING,
    from: DataTypes.STRING,
    attachment: DataTypes.TEXT,
    sentDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    comment: DataTypes.STRING
  })

  Email.associate = function (models) {
    // Email.id is the PK created by Sequelize by default
    Email.hasMany(models.EmailSendingRequest, { foreignKey: 'EmailId', as: 'sendingRequests' })
  }

  return Email
}
