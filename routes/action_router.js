const router = require('express').Router()
const { moveRequest, attackRequest , upgradeRequest, giveRequest, patchColorRequest } = require('../controllers/ActionController.js')
const { getPlayer, checkPlayer, checkGame } = require("../middlewares/action_middleware.js");

/**
 * Route root: /action
 */

router.post('/:gameId/move', getPlayer, checkPlayer, checkGame, moveRequest);

router.post('/:gameId/attack/:targetId/actions/:count', getPlayer, checkPlayer, checkGame, attackRequest);

router.post('/:gameId/give/:targetId/actions/:count', getPlayer, checkPlayer, checkGame, giveRequest)

router.post('/:gameId/upgrade/:upgrade/actions/:count', getPlayer, checkPlayer, checkGame, upgradeRequest);

// Player

router.patch('/:gameId/color/:color', getPlayer, checkGame, patchColorRequest)

module.exports = router;