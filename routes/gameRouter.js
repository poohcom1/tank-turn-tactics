const router = require('express').Router();
const { createGame } = require('../controllers/GameController.js')
const { createPlayer } = require('../controllers/PlayerController.js')

router.post('/create', createGame)

module.exports = router;