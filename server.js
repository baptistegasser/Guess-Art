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

const ConnectToMongoDB = require("./server/db");
const api = require('./server/api');
const socketHandler = require('./server/socketHandler');

// Récupération des constantes
const ENV_CURRENT = process.env.ENV;
const SESSION_SECRET = process.env.SESSION_SECRET;
const PORT = process.env.PORT || 3001;

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

// Requête vers l'api
app.use('/api/v1/', api);

// En prod on doit servir le build de React
if (ENV_CURRENT === 'production') {
    // Ne pas montrer que le serv utilise express
    app.disable('x-powered-by');

    // Renvoie l'app react
    app.use(express.static(path.join(__dirname, 'build')))
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'build', 'index.html'))
    })
} else {
    // Affiche les requêtes, utilie lors du dev
    app.use(morgan('dev'));
}

// Démarre le serveur
const server = app.listen(PORT, () => {
    console.log(`The serveur listen on ${PORT}`)
});

// Link socket.io to the http server create by express
const io = require('socket.io')(server);
// Configure the Room class instances to use this IO server
require('./server/model/room').setIO(io);

// socket.io use the sessions middleware to store session infos in request.session
io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});
// Middleware preventing access to client not signed in
io.use((socket, next) => {
    if(!socket.request.session.user) {
        console.log(`A client not signed in tried to connect from ${socket.request.connection.remoteAddress}`);
        return next(new Error('not authorized'));
    } else {
        next();
    }
});
// Set the handler for socket connetion
io.sockets.on('connection', socketHandler);
