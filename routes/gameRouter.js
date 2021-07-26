const router = require('express').Router();
const { createGame } = require('../controllers/GameController.js')

router.post('/create', createGame)

module.exports = router;