const Game = require('../models/GameModel.js')


function addGame(name, size, actionsPerDay, actionsPerInterval, tieCount,
                 allowVoteChange,
                 doActionQueue,
                 doBroadcastAction,
                 doFogOfWar,
                 doBounty,
                 doEscort) {
    const game = new Game({
        name: name,
        size: size,
        actionsPerDay: actionsPerDay,
        actionsPerInterval: actionsPerInterval,
        tieCount: tieCount,
        allowVoteChange: allowVoteChange,
        doActionQueue: doActionQueue,
        doBroadcastAction: doBroadcastAction,
        doFogOfWar: doFogOfWar,
        doBounty: doBounty,
        doEscort: doEscort
    })

    return game.save();
}