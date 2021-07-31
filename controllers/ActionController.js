const { checkRange, checkGrid } = require('../libs/game_utils.js')

// All routes to game will have req.game and req.player
const Player = require("../models/PlayerModel.js");

/**
 *
 * @param {Object} game
 * @param {Object} player
 * @param {Object} data
 * @return {Promise<{message: string, status: number}>}
 */
async function move(game, player, data) {
    const position = data.position;

    if (checkGrid(position, game) && checkRange(player.position, position, 1)) {
        try {
            player.position.x = position.x;
            player.position.y = position.y;
            player.actions--;

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
        targetPlayer = await Player.findById(data.targetId);
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
        targetPlayer = await Player.findById(data.targetId);
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
        action: 'move',
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
        const result = await move(req.game, req.player,{ position: req.params });

        await logAction(req.game, req.player._id, 'move', req.body, 'actionLog')

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
        const result = await attack(req.game, req.player, { targetId: req.params.targetId })

        await logAction(req.game, req.player._id, 'attack', { targetId: req.params.targetId }, 'actionLog')

        res.status(result.status).send(result.message)
    } else {
        const success = await logAction(req.game, req.player._id, 'attack', { targetId: req.params.targetId }, 'actionLog')

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
        const success = await logAction(req.game, req.player._id, 'upgrade', { upgrade: req.params.upgrade }, 'actionLog')

        if (success) {
            res.status(200).send('ok')
        } else {
            res.status(500).send(e)
        }
    }
}

async function giveRequest(req, res) {
    if (!req.game.doActionQueue) {
        const result = await give(req.game, req.player, { targetId: req.params.targetId });

        await logAction(req.game, 'give', req.player._id, { targetId: req.params.targetId }, 'actionLog')

        res.status(result.status).send(result.message)
    } else {
        const success = await logAction(req.game, req.player._id, 'give', { targetId: req.params.targetId }, 'actionLog')

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