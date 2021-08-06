const Game = require('../models/GameModel.js')
const Player = require('../models/PlayerModel.js')

/**
 * Checks if the player is authorized. Appends the user object to the request
 * @param req
 * @param res
 * @param next
 * @return {Promise<void>}
 */
module.exports.checkPlayer = async function (req, res, next) {
    const gameId = req.params.gameId;

    const player = await Player.findOne({ game_id: gameId, user_id: req.user.id })

    if (player && player.actions > 0 && player.health > 0) {
        req.player = player;
        next();
    } else {
        res.status(401).send()
    }
}

/**
 * Appends the game to the request
 * @param req
 * @param res
 * @param next
 */
module.exports.checkGame = async function (req, res, next) {
    const gameId = req.params.gameId;

    req.game = await Game.findById(gameId);

    next();
}
