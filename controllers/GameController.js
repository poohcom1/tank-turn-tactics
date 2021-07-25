const Game = require('../models/GameModel.js')

/**
 *
 * @param {Object} options
 * @return {Promise<Document<any, any, unknown>>}
 */
module.exports.createGame = function (options) {
    const game = new Game({
        name: options.name,
        size: options.size,
        actionsPerDay: options.actionsPerDay ?? 1,
        actionsPerInterval: options.actionsPerInterval ?? 2,
        tieCount: options.tieCount ?? 2,
        allowVoteChange: options.allowVoteChange ?? false,
        doActionQueue: options.doActionQueue ?? true,
        doBroadcastAction: options.doBroadcastAction ?? true,
        doFogOfWar: options.doFogOfWar ?? true,
        doBounty: options.doBounty ?? true,
        doEscort: options.doEscort ?? false
    })

    return game.save();
}

