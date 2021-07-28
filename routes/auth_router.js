const router = require('express').Router();
const passport = require('passport');
const { hashPassword, validPassword } = require('../libs/password_utils.js');
const User = require('../models/UserModel.js');

router.post('/register', (req, res, next) => {
    const { username, email, password } = req.body;

    hashPassword(password)
        .then(saltHash => {
            const user = new User({
                username: username,
                email: email,
                hash: saltHash.hash,
                salt: saltHash.salt
            })

            user.save()
                .then(() => res.redirect('/'))
                .catch(err => next(err))
        })
        .catch(err => next(err))
})

router.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login'}))

router.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
})

module.exports = router;