const router = require('express').Router()
const { moveRequest, attackRequest , upgradeRequest, giveRequest } = require('../controllers/ActionController.js')
const { checkPlayer, checkGame } = require("../middlewares/action_middleware.js");

/**
 * Route root: /action
 */

router.post('/:gameId/move', checkPlayer, checkGame, moveRequest);

router.post('/:gameId/attack/:targetId/actions/:count', checkPlayer, checkGame, attackRequest);

router.post('/:gameId/give/:targetId/actions/:count', checkPlayer, checkGame, giveRequest)

router.post('/:gameId/upgrade/:upgrade/count/:count', checkPlayer, checkGame, upgradeRequest);



module.exports = router;