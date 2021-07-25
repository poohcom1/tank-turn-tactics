const router = require('express').Router()
const passport = require('passport')
const { hashPassword, validPassword } = require('../libs/passwordUtils.js')
const User = require('../models/UserModel.js')

// Routes
router.get('/', (req, res) => {
    res.render('index')
})

router.get('/register', (req, res) => {
    res.render('register')
})

// body: email, username, password
router.get('/login', (req, res) => {
    res.render('login', { message: req.message ? res.message : '' })
})


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
                .then(() => res.send("success!"))
                .catch(err => next(err))
        })
        .catch(err => next(err))
})

router.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login'}))

module.exports = router;