module.exports = (sequelize, DataTypes) => {
  const RaceRecord = sequelize.define('RaceRecord', {
    time: DataTypes.STRING,
    debut: DataTypes.STRING,
    comment: DataTypes.STRING
  })

  RaceRecord.associate = function (models) {
    RaceRecord.belongsTo(models.Runner, { constraints: true,
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
      foreignKey: {
        name: 'RunnerId',
        allowNull: false
      } })
    RaceRecord.belongsTo(models.Race, { constraints: true,
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
      foreignKey: {
        name: 'RaceId',
        allowNull: false
      } })
  }

  return RaceRecord
}
