const router = require('express').Router()
const { isLoggedIn, isAdmin } = require('../middlewares/auth_middleware.js')
const Game = require('../models/GameModel.js')
const Player = require('../models/PlayerModel.js')
const { getUserGames } = require("../controllers/GameController.js");

// Pages
router.get('/', async (req, res) => {
    if (req.isAuthenticated()) {
        const games = await getUserGames(req.user.id)

        res.render('pages/index', { user: req.user.email, games: games })
    } else {
        res.redirect('/login')
    }
})

router.get('/register', (req, res) => {
    res.render('pages/register')
})

router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    res.render('pages/login', { message: req.message ? res.message : '' })
})

// Join/create
router.get('/create-game', isLoggedIn, (req, res) => {
    res.render('pages/game/create', { name: req.user.email } )
})

router.get('/join/:gameId?', isLoggedIn, (req, res, next) => {
    const { gameId } = req.params;

    res.render('pages/game/join', {
        gameName: "",
        name: req.user.email,
        usePassphrase: "",
        game_id: gameId ?? ''
    })
})

// Play
router.get('/play', isLoggedIn, async (req, res) => {
    const gameId = req.query.game

    const game = await Game.findById(gameId).lean();
    game.players = await Player.find({ game_id: game._id });
    game.user_id = req.user.id;

    if (game.hasStarted) {
        res.render('pages/game/game', { game: game })
    } else if (!game.players.find(player => player.user_id.equals(req.user.id))) {
        res.sendStatus(404)
    } else {
        res.render('pages/game/lobby', { isCreator: game.creator_id.equals(req.user.id), game: game })
    }
})

// Footer

router.get('/how-to-play', (req, res) => {
    res.render("pages/how-to-play")
})

router.get('/credits', (req, res) => {
    res.render("pages/credits")
})

router.get('/changelog', (req, res) => {
    res.render("pages/changelog")
})

// Admin
router.get('/admin', isAdmin, async (req, res) => {
    res.render("pages/admin/admin-table")
})

module.exports = (app) => {
    app.use('/', router)
    app.use('/auth', require('./auth_router.js'))
    app.use('/user', require('./user_router.js'))
    app.use('/game', require('./game_router.js'))
    app.use('/action', require('./action_router.js'))
}
