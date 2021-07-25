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

router.get('/create-game', (req, res) => {
    if (!req.user) {
        res.redirect('/login');
    } else {
        res.render('create_game', { username: req.user.username } )
    }
})

router.get('/game-created/:gameId', (req, res) => {
    const { gameId } = req.params;

    res.send(`<h1>Game Created!</h1><p>Id: ${gameId}</p>`)
})

module.exports = (app) => {
    app.use('/', router)
    app.use('/auth', require('./authRouter.js'))
    app.use('/game', require('./gameRouter.js'))
}