// Chargement des variables
require('dotenv').config();

const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require("body-parser");
const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');

const ConnecToMongoDB = require("./db");
const api = require('./api');

const ENV_CURRENT = process.env.ENV;
const SESSION_SECRET = process.env.SESSION_SECRET;

// Initialisation de la connection à la BD
ConnecToMongoDB();


// Parse la requête
// https://stackoverflow.com/a/4296402
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Gestion de la session avec des cookies et stockage dans MongoDB
app.use(session({
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false // Login se chargeras d'initialiser
}));


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
    app.use(morgan('tiny'));
}


// Requête vers l'api
app.use('/api/v1/', api);


// Autres requêtes
app.use((req, res) => {
    res.status(404).send('Unknow Request');
})


app.listen(8080);