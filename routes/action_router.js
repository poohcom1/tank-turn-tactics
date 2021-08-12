const router = require('express').Router()
const { moveReq, attackReq , upgradeReq, giveReq, patchColorReq,
    voteReq
} = require('../controllers/ActionController.js')
const { getPlayer, checkPlayer, checkGame } = require("../middlewares/action_middleware.js");

/**
 * Route root: /action
 */

router.post('/:gameId/move', getPlayer, checkPlayer, checkGame, moveReq);

router.post('/:gameId/attack/:targetId/actions/:count', getPlayer, checkPlayer, checkGame, attackReq);

router.post('/:gameId/give/:targetId/actions/:count', getPlayer, checkPlayer, checkGame, giveReq)

router.post('/:gameId/upgrade/:upgrade/actions/:count', getPlayer, checkPlayer, checkGame, upgradeReq);

// Player

/**
 * Vote types: "JURY"
 */
router.patch('/:gameId/vote/:vote/player/:playerId', getPlayer, checkGame, voteReq)

router.patch('/:gameId/color/:color', getPlayer, checkGame, patchColorReq)

module.exports = router;