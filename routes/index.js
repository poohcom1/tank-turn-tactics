const router = require('express').Router()
const { isLoggedIn, isAdmin } = require('../middlewares/auth_middleware.js')
const Game = require('../models/GameModel.js')
const { checkGame, checkPlayer } = require("../middlewares/action_middleware.js");

// Pages
router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('pages/index', { user: req.user.username })
    } else {
        res.redirect('/login')
    }
})

router.get('/register', (req, res) => {
    res.render('pages/register')
})

router.get('/login', (req, res) => {
    res.render('pages/login', { message: req.message ? res.message : '' })
})

// Join/create
router.get('/create-game', isLoggedIn, (req, res) => {
    res.render('pages/game/create', { username: req.user.username } )
})

router.get('/game-created/:gameId', isLoggedIn,(req, res) => {
    const { gameId } = req.params;

    res.send(`<h1>Game Created!</h1><p>Id: ${gameId}</p>`)
})


router.get('/join/:gameId?', isLoggedIn, (req, res, next) => {
    const { gameId } = req.params;

    // Game.findById(gameId, (err, game) => {
    //     if (err) next(err);
    //
    //     if (!game) throw new Error("Game not found")
    //
    //
    // })

    res.render('pages/game/join', {
        gameName: "",
        username: req.user.username,
        usePassphrase: "",
        game_id: gameId ?? ''
    })
})

// Play
router.get('/play', isLoggedIn, async (req, res) => {
    const gameId = req.query.game

    const game = await Game.findById(gameId)

    if (game.hasStarted) {
        res.render('pages/game/play')
    } else {
        res.render('pages/game/lobby', { isCreator: game.creator_id.equals(req.user.id) })
    }
})

// Admin
router.get('/admin', isAdmin, async (req, res) => {
    res.render("pages/admin")
})

module.exports = (app) => {
    app.use('/', router)
    app.use('/auth', require('./auth_router.js'))
    app.use('/user', require('./user_router.js'))
    app.use('/game', require('./game_router.js'))
    app.use('/action', require('./action_router.js'))
}