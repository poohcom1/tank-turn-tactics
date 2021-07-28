const router = require('express').Router()
const { move, attack } = require('../controllers/ActionController.js')
const { checkPlayer, checkGame } = require("../middlewares/action_middleware.js");

router.post('/:gameId/move', checkPlayer, checkGame, move);

router.post('/:gameId/attack', checkPlayer, checkGame, attack);

router.post('/:gameId/upgrade', checkPlayer, checkGame);

module.exports = router;