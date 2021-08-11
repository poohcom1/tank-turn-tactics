const router = require('express').Router();
const { createGameRequest, joinGameRequest, getGameRequest, startGameRequest, getUserGamesRequest, getPlayerRequest, getPlayers, deleteGameRequest, getAllGamesRequest,
    renamePlayerRequest,editGameRequest
} = require('../controllers/GameController.js')
const { isAdmin } = require("../middlewares/auth_middleware.js");

// Admin

router.delete('/:gameId', isAdmin, deleteGameRequest)

router.get('/all', isAdmin, getAllGamesRequest)

router.put('/:gameId', isAdmin, editGameRequest)

// User

router.post('/', createGameRequest);

router.get('/user', getUserGamesRequest)

router.get('/:gameId/player', getPlayerRequest)

router.get('/:gameId/players', getPlayers)

router.get('/:gameId', getGameRequest);

router.post('/player', joinGameRequest);

router.patch('/:gameId/start', startGameRequest);

router.patch('/:gameId/rename/:name', renamePlayerRequest)



module.exports = router;