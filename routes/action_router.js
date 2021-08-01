const router = require('express').Router()
const { moveRequest, attackRequest , upgradeRequest, giveRequest } = require('../controllers/ActionController.js')
const { checkPlayer, checkGame } = require("../middlewares/action_middleware.js");

/**
 * Route root: /action
 */

router.post('/:gameId/move/:x/:y', checkPlayer, checkGame, moveRequest);

router.post('/:gameId/attack/:targetId', checkPlayer, checkGame, attackRequest);

router.post('/:gameId/upgrade/:upgrade', checkPlayer, checkGame, upgradeRequest);

router.post('/:gameId/give/:targetId/actions/:count', checkPlayer, checkGame, giveRequest)

module.exports = router;