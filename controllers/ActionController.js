const { checkRange, checkGrid } = require('../libs/game_utils.js')

// All routes to game will have req.game and req.player
const Player = require("../models/PlayerModel.js");

function isAdjacent(pos1, pos2) {
    return (Math.abs(pos1.x - pos2.x) === 1 || Math.abs(pos1.y - pos2.y) === 1) && !(pos1.x === pos2.x && pos1.y === pos2.y)
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

    for (let i = 1; i < positions.length; i++) {
        if (!isAdjacent(positions[i-1], positions[i])) {
            return { status: 403, message: 'Positions not adjacent' }
        }
    }

    const position = positions[positions.length - 1]

    if (checkGrid(position, game)) {
        if ( ( await Player.find({ position: positions }) ).length !== 0 ) {
            return { status: 403, message: 'Collision with another player' };
        }

        try {
            player.position.x = position.x;
            player.position.y = position.y;
            player.actions -= positions.length;

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
 * @return {Promise<{message: string, status: number}>}
 */
async function attack(game, player, data) {
    let targetPlayer;

    try {
        targetPlayer = await Player.findById(data.target_id);
    } catch (e) {
        return { status: 500, message: e};
    }

    if (!checkRange(player.position, targetPlayer.position, player.range)) {
        return { status: 403, message: 'Out of bounds'};
    }

    try {
        if (targetPlayer.health > 0) {
            targetPlayer.health -= 1;
            await targetPlayer.save();
        }

        player.actions--;
        await player.save()

        return { status: 200, message: 'ok'};
    } catch (e) {
        await targetPlayer.updateOne(targetPlayer)
        await player.updateOne(player)

        return { status: 500, message: e};
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
    const UPGRADES = ["range", "sight", "health"]

    if (!UPGRADES.includes(data.upgrade)) {
        return { status: 403, message: 'Unknown upgrade'}
    }

    try {
        player[data.upgrade]++;

        player.actions--;
        await player.save()

        return { status: 200, message: 'ok'}
    } catch (e) {
        return { status: 501, message: e}
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

        player.actions -= parseInt(data.count);
        targetPlayer.actions += parseInt(data.count);

        await player.save();
        await targetPlayer.save();

        return { status: 200, message: 'ok'}
    } catch (e) {
        return { status: 500, message: e};
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

async function moveRequest(req, res) {
    if (!req.game.doActionQueue) {
        const result = await move(req.game, req.player, req.body);

        await logAction(req.game, req.player._id, 'move', req.body, 'actionLog')

        if (result.status !== 200) console.log(result.message)
        res.status(result.status).send(result.message)
    } else {
        const success = await logAction(req.game, req.player._id,  'move', req.body, 'actions')

        if (success) {
            res.status(200).send('ok')
        } else {
            res.status(500).send
        }
    }
}

async function attackRequest(req, res) {
    if (!req.game.doActionQueue) {
        const result = await attack(req.game, req.player, { target_id: req.params.targetId })

        await logAction(req.game, req.player._id, 'attack', { target_id: req.params.targetId }, 'actionLog')

        res.status(result.status).send(result.message)
    } else {
        const success = await logAction(req.game, req.player._id, 'attack', { target_id: req.params.targetId }, 'actions')

        if (success) {
            res.status(200).send('ok')
        } else {
            res.status(500).send()
        }
    }

}

async function upgradeRequest (req, res) {
    if (!req.game.doActionQueue) {
        const result = await upgrade(req.game, req.player, { upgrade: req.params.upgrade });

        await logAction(req.game, req.player._id, 'upgrade', { upgrade: req.params.upgrade }, 'actionLog')

        res.status(result.status).send(result.message)
    } else {
        const success = await logAction(req.game, req.player._id, 'upgrade', { upgrade: req.params.upgrade }, 'actions')

        if (success) {
            res.status(200).send('ok')
        } else {
            res.status(500).send(e)
        }
    }
}

async function giveRequest(req, res) {
    if (!req.game.doActionQueue) {
        const result = await give(req.game, req.player, { target_id: req.params.targetId, count: req.params.count });

        await logAction(req.game, 'give', req.player._id, { target_id: req.params.targetId }, 'actionLog')

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

module.exports = {
    move,
    attack,
    upgrade,
    give,
    moveRequest,
    attackRequest,
    upgradeRequest,
    giveRequest
}