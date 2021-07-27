const router = require('express').Router();
const { createGame, joinGame, getGame, initGame, getUserGames } = require('../controllers/GameController.js')

// Form routes
router.post('/create', createGame);

router.post('/join', joinGame);

// Get routes with params
router.get('/get/:gameId', getGame);

router.get('/init/:gameId', initGame);

// Get routes
router.get('/getGames', getUserGames)



module.exports = router;