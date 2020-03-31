module.exports = (sequelize, DataTypes) => {
  const Race = sequelize.define('Race', {
    name: DataTypes.STRING,
    year: DataTypes.STRING,
    dor: DataTypes.DATEONLY,
    distance: DataTypes.STRING,
    wmm: DataTypes.STRING(1),
    bq: DataTypes.STRING(1),
    desc: DataTypes.STRING,
    comment: DataTypes.STRING
  })

  Race.associate = function (models) {
  }

  return Race
}
