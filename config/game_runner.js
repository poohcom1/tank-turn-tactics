const schedule = require('node-schedule');
const Game = require('../models/GameModel.js')
const Player = require('../models/PlayerModel.js')
const actionFunctions =  require('../controllers/ActionController.js')

const rule = new schedule.RecurrenceRule();
rule.hour = 0;

schedule.scheduleJob(rule, async function() {
    const allGames = await Game.find({});

    console.log("Actions distributed!");
    allGames.forEach(distributeActions);

    const queuedGames = allGames.filter(game => game.doActionQueue);
    queuedGames.forEach(await doActionQueue);
});

async function distributeActions(game) {
    if (game.turnTimePassed >= game.turnTime) {
        game.turnTimePassed = 1;

        const allPlayers = await Player.find({ game_id: game._id});

        allPlayers.forEach(player => {
            player.actions += game.actionsPerInterval;
            player.save().then();
        })
    } else {
        game.turnTimePassed++;
    }

    await game.save();
}

async function doActionQueue(game) {
    const actions = game.actions;
    const players = await Player.find({ game_id: game._id });

    const ACTIONS_ORDER = ['give', 'attack', 'move', 'upgrade']

    const sortedActions = []

    ACTIONS_ORDER.forEach(actionName => {
        sortedActions.push(...actions.filter(action => action.action === actionName))
    })

    for (const action in sortedActions) {
        const player = findPlayer(players, action.player_id);

        await actionFunctions[action.action](game, player, action)
    }
}

function findPlayer(playerList, id) {
    return playerList.find(player => player.id === id)[0];
}