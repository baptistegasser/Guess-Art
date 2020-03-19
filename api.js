const router = require('express').Router();
const Bcrypt = require('bcryptjs');
const UserModel = require('./user');

router.post('/register', (req, res) => {
    const username = req.body.username;
    const password = Bcrypt.hashSync(req.body.password, 10);

    // Vérif qu'on a les params
    if (username === undefined || password === undefined) {
        return res.status(400).send();
    }

    try {
        
    } catch (err) {
        console.error(err);
        return res.status(500).send();
    }

    // Vérification que l'utilisateur n'existe pas
    UserModel.findOne({username: username}, function(err, user) {
        if (err) {
            console.error(err);
            return res.status(500).send();
        }

        if (user) {
            return res.status(409).send({ message: 'pseudo déjà utilisé' });
        } else {
            // Création d'un nouvel utilisateur
            let newUser = new UserModel();
            newUser.username = username;
            newUser.password = password;

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
    if (req.session.user) {
        res.status(200).send();
    }

    // Vérif qu'on a les params
    if (req.body.username === undefined || req.body.password === undefined) {
        return res.status(400).send();
    }

    UserModel.findOne({username: req.body.username}, function(err, user) {
        if (err) {
            console.error(err);
            return res.status(500).send();
        }

        // Pseudo non lié à un compte
        if (!user) {
            return res.status(400).send({ message: 'pseudo ou mot de passe invalide' });
        }

        // Mot de passe invalide
        if (!Bcrypt.compareSync(req.body.password, user.password)) {
            return res.status(400).send({ message: 'pseudo ou mot de passe invalide' });
        }

        // Sauvegarde la session
        req.session.user = user;
        res.status(200).send();
    });
});

module.exports = router;