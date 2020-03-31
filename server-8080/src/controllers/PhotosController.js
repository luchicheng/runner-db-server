const {
  Photo,
  Album
} = require('../models')

module.exports = {
  async importPhotos (req, res) {
    try {
      const albumName = req.body.albumName
      const userName = req.body.userName
      const photos = req.body.photos
      // console.log(req.body)
      // console.log(albumName)
      // console.log(photos)
      if (albumName === '') {
        res.status(500).send({
          error: 'Album name can not be empty.'
        })
      }
      let album = {}
      let countphotos = 0
      album.name = albumName
      album.comment = `imported @${new Date().toISOString().slice(0, 10)} by ${userName}`
      const albumCreated = await Album.create(album)

      await Promise.all(photos.map(async (p) => {
        try {
          let photo = {}
          photo.name = p.filename
          photo.gid = p.id
          photo.url = p.baseUrl
          photo.AlbumId = albumCreated.id
          const photoCreated = await Photo.create(photo)
          if (photoCreated.id) {
            countphotos = countphotos + 1
          }
        } catch (err) {
          console.log('photo duplicated:', p.filename)
        }
      }))
      console.log('photo imported:', countphotos)
      if (countphotos === 0) {
        await Album.destroy({ where: { id: albumCreated.id } })
        res.status(500).send({
          error: 'Import faild as all photos were imported already.'

        })
      } else {
        res.send({ message: `${countphotos} photos imported successfully!` })
      }
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'an error has occured trying to import the photos'
      })
    }
  }
}
