const Verification = require('../../verification');
const router = require('express').Router();
const Bcrypt = require('bcryptjs');
const UserModel = require('../../model/user');

// Route used to sign up and create a account for the app
router.post('/signup', (req, res) => {
    // Special case: manual register disabled by admin
    if (process.env.REGISTER_IS_ENABLED === 'NO') {
        return res.status(400).send({ message: 'Sorry, it\'s currently not possible to register for an account. Please come back alter !' });
    }

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
    const rememberMe = (req.body.rememberMe === 'true');

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

        user.password = undefined; // Set the password as undefined
        delete user.password; // Delete the password now that it's undefined
        req.session.user = user; // Create the session

        // If the user want to the cookie to live after the browser session
        if (rememberMe) {
            const hour = 3600000
            // will expire in a week
            req.session.cookie.maxAge = 7 * 24 * hour;
        } else {
            req.session.cookie.expires = false;
        }

        return res.status(200).send();
    });
});

// Route used to sign out of the app
router.get('/signout', (req, res) => {
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

// Route used to get user info such as: if he is logged in, his username
router.get('/user', (req, res) => {
    if (req.session.user) {
        res.status(200).send({
            logged: true,
            user: req.session.user
        });
    } else {
        res.status(200).send({
            logged: false,
        });
    }
});

// Test to know if we are logged in
router.get('/isLogged', (req, res) => {
    if(req.session.user) {
        res.status(200).send();
    } else {
        res.status(400).send();
    }
});

module.exports = router;
