const router = require('express').Router()
const passport = require('passport')

// Routes
router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('index', { user: req.user.username })
    } else {
        res.redirect('/login')
    }
})

router.get('/register', (req, res) => {
    res.render('register')
})

router.get('/login', (req, res) => {
    res.render('login', { message: req.message ? res.message : '' })
})

router.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
})

module.exports = (app) => {
    app.use('/', router)
    app.use('/auth', require('./authRouter.js'))
}