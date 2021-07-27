const router = require('express').Router();
const { createGame, joinGame, getGame, startGame, getUserGames, getPlayers, deleteGame } = require('../controllers/GameController.js')
const { isAdmin } = require("../middlewares/authMiddleware.js");

router.post('/', createGame);

router.get('/', getUserGames)

router.post('/player', joinGame);

router.put('/:gameId/start', startGame);

router.get('/:gameId/players', getPlayers)

router.get('/:gameId', getGame);

router.get('/:gameDelete', isAdmin, deleteGame)

module.exports = router;