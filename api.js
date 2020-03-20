const router = require('express').Router();
const Bcrypt = require('bcryptjs');
const UserModel = require('./user');

router.post('/register', (req, res) => {
    // Vérif qu'on a les params
    if (req.body.username === undefined || req.body.password === undefined) {
        return res.status(400).send({ message: 'données incomplètes' });
    }

    // Vérification que l'utilisateur n'existe pas
    UserModel.findOne({username: req.body.username}, function(err, user) {
        if (err) {
            console.error(err);
            return res.status(500).send();
        }

        if (user) {
            return res.status(400).send({ message: 'pseudo déjà utilisé' });
        } else {
            // Création d'un nouvel utilisateur
            let newUser = new UserModel();
            newUser.username = req.body.username;
            newUser.password = Bcrypt.hashSync(req.body.password, 10);

            newUser.save(function(err, user) {
                if (err) {
                    console.error(err);
                    return res.status(500).send();
                }

                return res.status(200).send();
            });
        }
    });
});

router.post('/login', (req, res) => {
    // Si on est connecter economisé une requête
    if (req.session.user) {
        return res.status(200).send();
    }

    // Vérif qu'on a les params
    if (req.body.username === undefined || req.body.password === undefined) {
        return res.status(400).send({ message: 'données incomplètes' });
    }

    UserModel.findOne({username: req.body.username}, function(err, user) {
        if (err) {
            console.error(err);
            return res.status(500).send();
        }

        // Pseudo non lié à un compte ou mot de passe invalide
        if (!user || !Bcrypt.compareSync(req.body.password, user.password)) {
            return res.status(400).send({ message: 'pseudo ou mot de passe invalide' });
        }

        // Sauvegarde la session
        req.session.user = user;
        return res.status(200).send();
    });
});

router.get('/logout', (req, res) => {
    // Si on est pas connecter, erreur
    if (!req.session.user) {
        return res.status(200).send();
    }
    
    // Supprime la session
    req.session.destroy(function(err) {
        if (err) {
            return res.status(500).send();
        } else {
            return res.status(200).send();
        }
    });
});

module.exports = router;