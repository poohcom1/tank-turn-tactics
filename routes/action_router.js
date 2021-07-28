const router = require('express').Router()
const { move, attack , upgrade} = require('../controllers/ActionController.js')
const { checkPlayer, checkGame } = require("../middlewares/action_middleware.js");

router.post('/:gameId/move', checkPlayer, checkGame, move);

router.post('/:gameId/attack/:targetId', checkPlayer, checkGame, attack);

router.post('/:gameId/upgrade/:upgrade', checkPlayer, checkGame, upgrade);

module.exports = router;