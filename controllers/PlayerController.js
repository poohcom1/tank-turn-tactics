const Player = require('../models/PlayerModel.js')


module.exports.createPlayer = function (userId, gameId, name) {
    const player = new Player({
        user_id: userId,
        game_id: gameId,
        name
    })

    return player.save();
}

module.exports.getGameFromPlayer = function (playerId) {

}