const { checkRange, checkGrid } = require('../libs/game_utils.js')

// Router: ./routes/action_router.js

// All routes to game will have req.game and req.player
const Player = require("../models/PlayerModel.js");

function isAdjacent(pos1, pos2) {
    return (Math.abs(pos1.x - pos2.x) === 1 || Math.abs(pos1.y - pos2.y) === 1)
        && !(Math.abs(pos1.x - pos2.x) === 1 && Math.abs(pos1.y - pos2.y) === 1) // XOR
        && !(pos1.x === pos2.x && pos1.y === pos2.y) // Not the same point
}

/**
 *
 * @param {Object} game
 * @param {Object} player
 * @param {Object} data
 * @return {Promise<{message: string, status: number}>}
 */
async function move(game, player, data) {
    const positions = data.positions;

    if (positions.length > player.actions) {
        return { status: 403, message: 'Not enough actions' }
    }

    const positionsFromPlayer = [player.position, ...positions]
    for (let i = 1; i < positionsFromPlayer.length; i++) {
        if (!isAdjacent(positionsFromPlayer[i - 1], positionsFromPlayer[i])) {
            return { status: 403, message: 'Positions not adjacent' }
        }
    }

    const finalPosition = positions[positions.length - 1]

    if (checkGrid(finalPosition, game)) {
        if ((await Player.find({ position: positions })).length !== 0) {
            return { status: 403, message: 'Collision with another player' };
        }

        try {
            player.position.x = finalPosition.x;
            player.position.y = finalPosition.y;
            player.actions -= positions.length;

            if (player.actions < 0) {
                return { status: 403, message: 'Not enough actions' }
            }

            await player.save();
        } catch (e) {
            return { status: 500, message: e }
        }

        return { status: 200, message: 'ok' };
    } else {
        return { status: 403, message: 'Out of bounds' };
    }
}

/**
 *
 * @param {Object} game
 * @param {Object} player
 * @param {Object} data
 * @return {Promise<{message: string, status: number, killed: boolean}>}
 */
async function attack(game, player, data) {
    let targetPlayer;

    try {
        targetPlayer = await Player.findById(data.target_id);
    } catch (e) {
        return { status: 500, message: e, killed: false };
    }

    if (!checkRange(player.position, targetPlayer.position, player.range)) {
        return { status: 403, message: 'Out of bounds', killed: false };
    }

    try {
        if (targetPlayer.health <= 0) return { status: 500, message: 'Player already dead', killed: false }

        targetPlayer.health -= parseInt(data.count);
        await targetPlayer.save();

        let killed = false;

        // Killed
        if (targetPlayer.health <= 0) {
            player.actions += targetPlayer.actions
            killed = true;

            const players = game
        }

        player.actions -= parseInt(data.count);
        await player.save()

        return { status: 200, message: 'ok', killed };
    } catch (e) {
        await targetPlayer.updateOne(targetPlayer)
        await player.updateOne(player)

        return { status: 500, message: e, killed: false };
    }
}

/**
 *
 * @param {Object} game
 * @param {Object} player
 * @param {Object} data
 * @return {Promise<{message: string, status: number}>}
 */
async function upgrade(game, player, data) {
    const UPGRADES = [ "range", "sight", "health" ]
    const COST = {
        health: 2,
        range: 1,
        sight: 1
    }

    if (!UPGRADES.includes(data.upgrade)) {
        return { status: 403, message: 'Unknown upgrade' }
    }

    try {
        player[data.upgrade] += parseInt(data.count);

        player.actions -= COST[data.upgrade] * parseInt(data.count);

        if (player.actions < 0) {
            return { status: 501, message: "Not enough energy" }
        }

        await player.save()

        return { status: 200, message: 'ok' }
    } catch (e) {
        console.log(e)
        return { status: 501, message: e }
    }
}

/**
 *
 * @param {Object} game
 * @param {Object} player
 * @param {Object} data
 * @return {Promise<{message: string, status: number}>}
 */
async function give(game, player, data) {
    let targetPlayer;


    try {
        targetPlayer = await Player.findById(data.target_id);

        if (game.giveRangeOffset && game.giveRangeOffset >= 0) {
            if (!checkRange(player.position, targetPlayer.position, player.range + game.giveRangeOffset)) {
                return { status: 500, message: 'Out of range' };
            }
        }

        player.actions -= parseInt(data.count);
        targetPlayer.actions += parseInt(data.count);

        await player.save();
        await targetPlayer.save();

        return { status: 200, message: 'ok' }
    } catch (e) {
        return { status: 500, message: e };
    }
}

/**
 *
 * @param {Object} game
 * @param {string} playerId
 * @param {string} action
 * @param {Object} data
 * @param {('actions'|'actionLog')} type
 * @return {Promise<boolean>}
 */
async function logAction(game, playerId, action, data, type) {
    game[type].push({
        action: action,
        player_id: playerId,
        ...data
    })

    try {
        await game.save();

        return true;
    } catch (e) {
        return false;
    }
}

async function moveReq(req, res) {
    if (!req.game.doActionQueue) {
        const result = await move(req.game, req.player, req.body);

        await logAction(req.game, req.player._id, 'move', req.body, 'actionLog')

        if (result.status !== 200) console.log(result.message)
        res.status(result.status).send(result.message)
    } else {
        const success = await logAction(req.game, req.player._id, 'move', req.body, 'actions')

        if (success) {
            res.status(200).send('ok')
        } else {
            res.status(500).send
        }
    }
}

async function attackReq(req, res) {
    if (!req.game.doActionQueue) {
        const result = await attack(req.game, req.player, { target_id: req.params.targetId, count: req.params.count })

        await logAction(req.game, req.player._id, 'attack', { target_id: req.params.targetId, killed: result.killed, count: req.params.count }, 'actionLog')

        res.status(result.status).send(result.message)
    } else {
        const success = await logAction(req.game, req.player._id, 'attack', { target_id: req.params.targetId, count: req.params.count }, 'actions')

        if (success) {
            res.status(200).send('ok')
        } else {
            res.status(500).send()
        }
    }

}

async function upgradeReq(req, res) {
    if (!req.game.doActionQueue) {
        const result = await upgrade(req.game, req.player, { upgrade: req.params.upgrade, count: req.params.count });

        await logAction(req.game, req.player._id, 'upgrade', {
            upgrade: req.params.upgrade,
            count: req.params.count
        }, 'actionLog')

        res.status(result.status).send(result.message)
    } else {
        const success = await logAction(req.game, req.player._id, 'upgrade', {
            upgrade: req.params.upgrade,
            count: req.params.count
        }, 'actions')

        if (success) {
            res.status(200).send('ok')
        } else {
            res.status(500).send()
        }
    }
}

async function giveReq(req, res) {
    if (!req.game.doActionQueue) {
        const result = await give(req.game, req.player, { target_id: req.params.targetId, count: req.params.count });

        await logAction(req.game, req.player._id, 'give' , { target_id: req.params.targetId, count: req.params.count }, 'actionLog')

        res.status(result.status).send(result.message)
    } else {
        const success = await logAction(req.game, req.player._id, 'give', { target_id: req.params.targetId }, 'actions')

        if (success) {
            await req.game.save();

            res.status(200).send('ok')
        } else {
            res.status(500).send()
        }
    }
}



// Player controller
async function voteReq(req, res) {
    voteReq.VOTE_TYPES = {
        JURY: 'vote_jury'
    }

    voteReq.voteTypeError = "Unknown voting type!"
    voteReq.playerDeadError = "Voting player not dead or voted player already dead!"
    voteReq.playerNotFoundError = "Player not found!"

    const player = req.player;
    const voteType = req.params.vote;

    if (!Object.values(voteReq.VOTE_TYPES).includes(voteType)) {
        console.log(voteReq.voteTypeError + ": " + voteType)
        return res.status(403).send(voteReq.voteTypeError);
    }

    // Check if player id is valid
    let votedPlayer;
    try {
        votedPlayer = await Player.findById(req.params.playerId)

        if (!votedPlayer || !votedPlayer.game_id.equals(req.game._id)) {
            console.log(voteReq.playerNotFoundError);
            return res.status(403).send(voteReq.playerNotFoundError);
        }

        if (votedPlayer.health <= 0 || player.health > 0) {
            console.log(voteReq.playerDeadError);
            return res.status(403).send(voteReq.playerDeadError)
        }

    } catch (e) {
        console.log(e)
        return res.status(501).send(e)
    }

    player[voteType] = votedPlayer._id;

    try {
        await player.save();
        res.status(200).send()
    } catch (e) {
        console.log(e)
        res.status(501).send(e)
    }
}

async function patchColorReq(req, res) {
    const player = req.player
    const color = req.params.color;

    if (!require('validate-color').validateHTMLColor(color)) {
        return res.status(403).send()
    }

    player.color = color;

    try {
        await player.save();
        res.status(200).send()
    } catch (e) {
        res.status(501).send(e)
    }
}

module.exports = {
    move,
    attack,
    upgrade,
    give,

    moveReq,
    attackReq,
    upgradeReq,
    giveReq,

    voteReq,

    patchColorReq,

    isAdjacent
}