const router = require('express').Router();
const { createGame, joinGame, getGame, initGame, getUserGames } = require('../controllers/GameController.js')

router.post('/create', createGame);

router.post('/join', joinGame);

router.get('/get/:gameId', getGame);

router.get('/getGames', getUserGames)

router.get('/init/:gameId', initGame);

module.exports = router;