const schedule = require('node-schedule');
const Game = require('../models/GameModel.js')
const Player = require('../models/PlayerModel.js')
const actionFunctions = require('../controllers/ActionController.js')
const { deleteGame } = require("../controllers/GameController.js");

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
    allGames.forEach(performActions);

    // Remove old games

    for (let i = 0; i < allGames.length; i++) {
        const game = allGames[i];
        const players = await Player.find({ game_id: game._id })

        if (players.filter(p => p.health > 0).length <= 1 && (new Date() - new Date(game.updatedAt) > (1000 * 60 * 60 * 24))) {
            await deleteGame(game._id)
        }
    }
});

async function performActions(game) {
    const players = await Player.find({ game_id: game._id });

    await distributeActions(game, players)

    // if (game.doActionQueue) {
    //     await doActionQueue(game)
    // }

    await game.save();
}

async function distributeActions(game, players) {
    if (game.turnTimePassed >= game.turnTime) {
        game.turnTimePassed = 1;

        await calculateVotes(game, players)

        players.map(async player => {
            player.actions += game.actionsPerInterval;
            await player.save()
        })
    } else {
        game.turnTimePassed++;
    }
}

async function calculateVotes(game, players) {
    const alivePlayers = players.filter(p => p.health > 0 )
    const deadPlayers = players.filter(p => p.health <= 0 )

    const VOTE_TYPES = ["vote_jury"]

    for (const voteType of VOTE_TYPES) {
        const votes = {}

        alivePlayers.forEach(p => votes[p._id.toString()] = 0)

        let maxVotes = 0;
        let maxPlayerId = null;
        let tied = false;

        for (const voter of deadPlayers) {
            let votedPlayerId = voter[voteType]

            if (votedPlayerId) {
                votedPlayerId = votedPlayerId.toString()
                votes[votedPlayerId]++;

                if (votes[votedPlayerId] >= maxVotes) {
                    tied = votes[votedPlayerId] === maxVotes

                    maxPlayerId = votedPlayerId
                    maxVotes = votes[votedPlayerId]
                }

                voter[voteType] = null;
                await voter.save();
            }
        }

        if (tied) {
            game.actionLog.push({
                action: 'vote',
                vote: 'jury',
                vote_tied: true
            })
            await game.save()
            console.log("Votes tied")
        } else if (maxPlayerId) {
            const winner = alivePlayers.find(p => p._id.toString() === maxPlayerId)
            try {
                winner.actions++;
                await winner.save()

                game.actionLog.push({
                    action: 'vote',
                    vote: 'jury',
                    vote_tied: false,
                    target_id: winner._id
                })
                await game.save()

                console.log("Jury has awarded points to " + winner.name)
            } catch (e) {
                console.log(e)
            }
        }
    }
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
