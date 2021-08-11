const Game = require('../models/GameModel.js')
const Player = require('../models/PlayerModel.js')

/**
 * Appends the player of the game to the request
 * @param req
 * @param res
 * @param next
 * @return {Promise<void>}
 */
module.exports.getPlayer = async function (req, res, next) {
    const gameId = req.params.gameId;

    req.player = await Player.findOne({ game_id: gameId, user_id: req.user.id });

    next();
}


/**
 * Checks if the player is authorized. Checks the player in the request
 * @param req
 * @param res
 * @param next
 * @return {Promise<void>}
 */
module.exports.checkPlayer = async function (req, res, next) {
    const player = req.player

    if (player && player.actions > 0 && player.health > 0) {
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
