const router = require('express').Router()
const { checkAuth } = require('../middlewares/authMiddleware.js')
const Game = require('../models/GameModel.js')

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
router.get('/create-game', (req, res) => {
    if (!req.user) {
        res.redirect('/login');
    } else {
        res.render('pages/game_create', { username: req.user.username } )
    }
})

router.get('/game-created/:gameId', checkAuth,(req, res) => {
    const { gameId } = req.params;

    res.send(`<h1>Game Created!</h1><p>Id: ${gameId}</p>`)
})


router.get('/join/:gameId?', checkAuth, (req, res, next) => {
    const { gameId } = req.params;

    // Game.findById(gameId, (err, game) => {
    //     if (err) next(err);
    //
    //     if (!game) throw new Error("Game not found")
    //
    //
    // })

    res.render('pages/game_join', {
        gameName: "",
        username: req.user.username,
        usePassphrase: "",
        game_id: gameId ?? ''
    })
})

// Play

router.get('/play', checkAuth, async (req, res) => {
    const gameId = req.query.game
    //
    // if (!(await Game.findById(gameId)).hasStarted) {
    //     res.redirect('/join/' + gameId)
    // }

    res.render('pages/game_play')
})

module.exports = (app) => {
    app.use('/', router)
    app.use('/auth', require('./authRouter.js'))
    app.use('/game', require('./gameRouter.js'))
}