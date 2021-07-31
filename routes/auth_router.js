const router = require('express').Router();
const passport = require('passport');
const { hashPassword, validPassword } = require('../libs/password_utils.js');
const User = require('../models/UserModel.js');

router.get('/checkUser')

router.post('/register', (req, res, next) => {
    const { email, password } = req.body;

    hashPassword(password)
        .then(saltHash => {
            const user = new User({
                email: email,
                hash: saltHash.hash,
                salt: saltHash.salt
            })

            console.log(user)

            user.save()
                .then(() => res.redirect('/'))
                .catch(err => {
                    console.log(err)
                    res.redirect(`/register?error=true`)
                })
        })
        .catch(err => res.redirect(`/register?error=true`))
})

router.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login?error=true'}))

router.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/login')
})

module.exports = router;