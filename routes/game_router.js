const router = require('express').Router();
const { createGame, joinGame, getGame, startGame, getUserGames, getPlayer, getPlayers, deleteGame, getAllGames } = require('../controllers/GameController.js')
const { isAdmin } = require("../middlewares/authMiddleware.js");

// Admin

router.delete('/:gameId', isAdmin, deleteGame)

router.get('/all', isAdmin, getAllGames)

// User

router.post('/', createGame);

router.post('/player', joinGame);

router.get('/', getUserGames)

router.get('/:gameId/player', getPlayer)

router.get('/:gameId/players', getPlayers)

router.get('/:gameId', getGame);

router.put('/:gameId/start', startGame);


module.exports = router;