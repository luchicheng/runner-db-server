// server.js
// where your node app starts

// init project
const express = require('express');
const {getAlbum} = require('./google-photos')
const app = express();

// authorize CORS (for demo only)
app.use(function(req, res, next) {
  const origin = req.headers.origin;
  if(origin){
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/backapi2/:id', async function(request, response) {
  try {
    const results = await getAlbum(request.params.id)
    response.json(results);
  }
  catch(e) {
    response.status(500) 
  }
});

// listen for requests :)
const listener = app.listen('61844', function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
