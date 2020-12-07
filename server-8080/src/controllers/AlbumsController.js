const { Album, Photo } = require('../models')

module.exports = {
  async index (req, res) {
    try {
      let albums = null
      const search = req.query.search
      if (search) {
        albums = await Album.findAll({
          where: {
            $or: [
              'name', 'comment'
            ].map(key => ({
              [key]: {
                $like: `%${search}%`
              }
            }))
          },
          order: [
            ['name', 'DESC'],
            ['updatedAt', 'DESC']
          ]
        })
          .map(el => el.get({ plain: true })) // add this line to code
        // TODO const sequelize = new Sequelize('connectionUri', { define: { raw: true } });
      } else {
        albums = await Album.findAll({
          limit: 500,
          order: [
            ['name', 'DESC'],
            ['updatedAt', 'DESC']
          ]
        })
          .map(el => el.get({ plain: true })) // add this line to code
      }
      // console.log(albums)
      res.send(albums)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to fetch the albums'
      })
    }
  },
  async indexPhotos (req, res) {
    try {
      let photos = []
      const albumId = req.params.albumId
      photos = await Photo.findAll({
        limit: 100,
        where: {
          AlbumId: albumId
        }
      })
        .map(el => el.get({ plain: true })) // add this line to code

      // console.log(albums)
      res.send(photos)
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'an error has occured trying to fetch the albums'
      })
    }
  },
  async post (req, res) {
    try {
      // console.log('album id.....', req.body.id)
      if (req.body.id) {
        await Album.update(req.body, {
          where: {
            id: req.body.id
          }
        })
        res.send(req.body)
        return
      } else {
        const album = await Album.create(req.body)
        res.send(album)
      }
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to create/update the album'
      })
    }
  },
  async del (req, res) {
    try {
      const album = await Album.findById(req.params.albumId)
      if (album) {
        await Album.destroy({
          where: {
            id: req.params.albumId
          }
        })
      }
      res.send(album)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to show the albums'
      })
    }
  }
}
