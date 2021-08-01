const router = require('express').Router();
const { register, logout } = require('../controllers/AuthController.js')
const passport = require('passport');
const { hashPassword, validPassword } = require('../libs/password_utils.js');
const User = require('../models/UserModel.js');

router.post('/register', register)

router.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login?error=true'}))

router.post('/logout', logout)

module.exports = router;