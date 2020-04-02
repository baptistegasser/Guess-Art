// Chargement des variables depuis le .env
require('dotenv').config();

const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require("body-parser");
const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');

const ConnectToMongoDB = require("./db");
const api = require('./api');
const handleConnection = require('./salon');

// Récupération des constantes
const ENV_CURRENT = process.env.ENV;
const SESSION_SECRET = process.env.SESSION_SECRET;
const LISTEN_IP = process.env.LISTEN_IP;
const LISTEN_PORT = process.env.LISTEN_PORT;

// Initialisation de la connection à la BD
ConnectToMongoDB();


// Parse la requête pour un accès facile au données
// https://stackoverflow.com/a/4296402
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


// Middleware to handle sessions
const sessionMiddleware = session({
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
        ttl: 0 // Expire en fin de session
    }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false // Pas de creation automatique de session
})

// Express app use the sessions middleware
app.use(sessionMiddleware);


// Middleware pour les page qui nécessitent la connection
// TODO enlever /none, il est là pour pas prendre le défaut qui est '/'
const NEED_LOGIN = ['/none'];
app.use(NEED_LOGIN, function(req, res, next) {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        next();
    }
});


// En prod on doit servir le build de React
if (ENV_CURRENT === 'production') {
    // Ne pas montrer que le serv utilise express
    app.disable('x-powered-by');

    // Renvoie l'app react
    app.use(express.static(path.join(__dirname, 'build')))
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'build', 'index.html'))
    })
} else {
    // Affiche les requêtes, utilie lors du dev
    app.use(morgan('tiny'));
}


// Requête vers l'api
app.use('/api/v1/', api);


// Autres requêtes
app.use((req, res) => {
    res.status(404).send('Unknow Request');
})


// Démarre le serveur
const server = app.listen(LISTEN_PORT, LISTEN_IP, () => {
    console.log(`Le serveur écoute sur: ${LISTEN_IP}:${LISTEN_PORT}`)
});

// Link socket.io to the http server create by express
const io = require('socket.io')(server);
// socket.io use the sessions middleware
io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});
io.sockets.on('connection', handleConnection);
