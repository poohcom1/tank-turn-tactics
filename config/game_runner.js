const schedule = require('node-schedule');
const Game = require('../models/GameModel.js')
const Player = require('../models/PlayerModel.js')
const actionFunctions = require('../controllers/ActionController.js')

let cronString = '0 * * * *';

if (process.env.INTERVAL_MODE) {
    if (process.env.INTERVAL_MODE === 'minute') {
        cronString = '0 * * * * *';
        console.log('[app] Running on minute interval mode')
    }
}

schedule.scheduleJob(cronString, async function() {
    // Get all started games
    const allGames = await Game.find({ hasStarted: true });

    // Distribute actions
    console.log("[app] Actions distributed! - " + new Date());
    allGames.forEach(distributeActions);
});

async function distributeActions(game) {
    if (game.turnTimePassed >= game.turnTime) {
        game.turnTimePassed = 1;

        const allPlayers = await Player.find({ game_id: game._id });

        allPlayers.map(async player => {
            player.actions += game.actionsPerInterval;
            await player.save()
        })
    } else {
        game.turnTimePassed++;
    }

    // if (game.doActionQueue) {
    //     await doActionQueue(game)
    // }

    await game.save();
}

async function doActionQueue(game) {
    const actions = game.actions;
    const players = await Player.find({ game_id: game._id });

    const ACTIONS_ORDER = ['give', 'attack', 'move', 'upgrade']

    const sortedActions = []

    // Order action by filtering
    ACTIONS_ORDER.forEach(actionName => {
        sortedActions.push(...actions.filter(action => action.action === actionName))
    })

    for (const action of sortedActions) {
        const player = players.find(player => player._id.equals(action.player_id));

        const result = await actionFunctions[action.action](game, player, action)
        if (result.status !== 200) console.log(result.message)
    }

    game.actions = [];
}
