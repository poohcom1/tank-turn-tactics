const router = require('express').Router();
const { createGame, joinGame, getGame, startGame, getUserGamesRequest, getPlayer, getPlayers, deleteGame, getAllGames,
    renamePlayer
} = require('../controllers/GameController.js')
const { isAdmin } = require("../middlewares/auth_middleware.js");

// Admin

router.delete('/:gameId', isAdmin, deleteGame)

router.get('/all', isAdmin, getAllGames)

// User

router.post('/', createGame);

router.post('/player', joinGame);

router.get('/', getUserGamesRequest)

router.get('/:gameId/player', getPlayer)

router.get('/:gameId/players', getPlayers)

router.get('/:gameId', getGame);

router.put('/:gameId/start', startGame);

router.put('/:gameId/rename/:name', renamePlayer)

module.exports = router;