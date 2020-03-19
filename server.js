const express = require('express')
const path = require('path')
const app = express()

const dev = app.get('env') !== 'production';

// En prod on doit servir le build de React
if (!dev) {
    // Ne pas montrer que le serv utilise express
    app.disable('x-powered-by');

    // Renvoie l'app react
    app.use(express.static(path.join(__dirname, 'build')))
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'build', 'index.html'))
    })
}

app.get('/ping', (req, res) => {
  return res.send('pong')
})

app.listen(8080)