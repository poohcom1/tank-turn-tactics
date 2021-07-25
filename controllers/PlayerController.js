const Player = require('../models/PlayerModel.js')


module.exports.createPlayer = function (user_id, game_id, name) {
    const player = new Player({
        user_id,
        game_id,
        name
    })

    return player.save();
}
