module.exports = (sequelize, DataTypes) => {
  const Album = sequelize.define('Album', {
    name: DataTypes.STRING,
    comment: DataTypes.STRING
  })

  Album.associate = function (models) {
  }

  return Album
}
