const router = require('express').Router();
const { createGameRequest, joinGameRequest, getGameRequest, startGameRequest, getUserGamesRequest, getPlayerRequest, getPlayers, deleteGameRequest, getAllGamesRequest,
    renamePlayerRequest,editGameRequest
} = require('../controllers/GameController.js')
const { isAdmin } = require("../middlewares/auth_middleware.js");

// Admin

router.delete('/:gameId', isAdmin, deleteGameRequest)

router.get('/all', isAdmin, getAllGamesRequest)

//router.post('/:gameId', isAdmin, editGameRequest)

// User

router.post('/', createGameRequest);

router.post('/player', joinGameRequest);

router.get('/user', getUserGamesRequest)

router.get('/:gameId/player', getPlayerRequest)

router.get('/:gameId/players', getPlayers)

router.get('/:gameId', getGameRequest);

router.put('/:gameId/start', startGameRequest);

router.put('/:gameId/rename/:name', renamePlayerRequest)



module.exports = router;