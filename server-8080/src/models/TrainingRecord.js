module.exports = (sequelize, DataTypes) => {
  const TrainingRecord = sequelize.define('TrainingRecord', {
    date: DataTypes.DATEONLY,
    distance: DataTypes.STRING,
    time: DataTypes.STRING,
    currentPerf: DataTypes.STRING,
    comment: DataTypes.STRING
  })

  TrainingRecord.associate = function (models) {
    TrainingRecord.belongsTo(models.Runner)
  }

  return TrainingRecord
}
