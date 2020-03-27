const Verification = require('./src/Verification');
const router = require('express').Router();
const Bcrypt = require('bcryptjs');
const UserModel = require('./user');

// Route used to sign up and create a account for the app
router.post('/signup', (req, res) => {
    // Retrieve data for usage
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    // check the data is valid
    if (!Verification.checkString(email, 'E-mail') || !Verification.checkString(username, 'Username') || !Verification.checkPassword(password)) {
        return res.status(400).send({ message: Verification.getMessage() });
    }

    // Try to find a user
    UserModel.findOne({username: username}, function(err, user) {
        if (err) {
            console.error(err);
            return res.status(500).send();
        }

        // If there is a result: username already taken
        if (user) {
            return res.status(400).send({ message: 'Username already taken.' });
        } else {
            // Create a new user here
            let newUser = new UserModel();
            newUser.username = username;
            newUser.password = Bcrypt.hashSync(password, 10);

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

// Route used to sign in the app
router.post('/signin', (req, res) => {
    // If we are connected, send a valid response
    if (req.session.user) {
        return res.status(200).send();
    }

    // Retrieve data for usage
    const username = req.body.username;
    const password = req.body.password;
    
    // check the data is valid
    if (!Verification.checkString(username, 'Username') || !Verification.checkString(password, 'Password')) {
        return res.status(400).send({ message: Verification.getMessage() });
    }

    // Request the database to find the username
    UserModel.findOne({username: username}, function(err, user) {
        if (err) {
            console.error(err);
            return res.status(500).send();
        }

        // Username don't exist or invalid password
        if (!user || !Bcrypt.compareSync(password, user.password)) {
            return res.status(400).send({ message: 'Username or password invalid.' });
        }

        // Create the session
        req.session.user = user;
        return res.status(200).send();
    });
});

// Route used to sign out of the app
router.all('/signout', (req, res) => {
    // If we are not connected, ignore and send success
    if (!req.session.user) {
        return res.status(200).send();
    }
    
    // Delete the session and send the response
    req.session.destroy(function(err) {
        if (err) {
            return res.status(500).send();
        } else {
            return res.status(200).send();
        }
    });
});

module.exports = router;