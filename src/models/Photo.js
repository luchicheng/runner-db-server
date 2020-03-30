module.exports = (sequelize, DataTypes) => {
  const Photo = sequelize.define('Photo', {
    name: DataTypes.STRING,
    url: DataTypes.STRING,
    gid: { type: DataTypes.STRING, unique: true },
    comment: DataTypes.STRING
  })

  Photo.associate = function (models) {
    Photo.belongsTo(models.Album, {
      constraints: true,
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
      foreignKey: {
        name: 'AlbumId',
        allowNull: false
      }
    })
  }

  return Photo
}
