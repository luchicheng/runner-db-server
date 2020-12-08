module.exports = (sequelize, DataTypes) => {
  const Runner = sequelize.define('Runner', {
    name: DataTypes.STRING,
    dob: DataTypes.DATEONLY,
    gender: DataTypes.STRING,
    nickName: DataTypes.STRING,
    size: DataTypes.STRING,
    phone: DataTypes.STRING,
    eName: DataTypes.STRING,
    ePhone: DataTypes.STRING,
    comment: DataTypes.STRING,
    goalRaceTime: DataTypes.STRING,
    referer: DataTypes.STRING,
    personalBest: DataTypes.STRING,
    runningAge: DataTypes.STRING,
    otherSportsHobbies: DataTypes.STRING,
    personalTarget: DataTypes.STRING
  })

  Runner.associate = function (models) {
    Runner.belongsTo(models.Race)
  }

  return Runner
}
