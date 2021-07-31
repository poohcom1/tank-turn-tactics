
// All routes to game will have req.game and req.player

const Player = require("../models/PlayerModel.js");

function checkRange(position, target, range) {
    return Math.abs(position.x - target.x) <= range && Math.abs(position.y - target.y) <= range
}

function checkGrid(position, game) {
    return position.x >= 0 && position.y >= 0 && position.x < game.size.width && position.y < game.size.height
}

/**
 *
 * @param player
 * @param game
 * @param position
 * @return {Promise<{message: string, status: number}>}
 */
async function move(player, game, position) {
    if (checkGrid(position, game) && checkRange(player.position, position, player.range)) {
        try {
            await player.updateOne({
                position: {
                    x: position.x,
                    y: position.y
                },
                actions: player.actions-1
            })
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
 * @param player
 * @param targetId
 * @return {Promise<{message: string, status: number}>}
 */
async function attack(player, targetId) {
    let targetPlayer;

    try {
        targetPlayer = await Player.findById(targetId);
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
 * @param player
 * @param upgrade
 * @return {Promise<{message: string, status: number}>}
 */
async function upgrade(player, upgrade) {
    const UPGRADES = ["range", "sight", "health"]

    if (!UPGRADES.includes(upgrade)) {
        return { status: 403, message: 'Unknown upgrade'}
    }

    try {
        player[upgrade]++;

        await player.save()

        return { status: 200, message: 'ok'}
    } catch (e) {
        return { status: 501, message: e}
    }
}

module.exports.moveRequest = async (req, res) => {
    if (!req.game.doActionQueue) {

        const result = await move(req.player, req.game, { x: req.params.x, y: req.params.y });

        res.status(result.status).send(result.message)
    } else {
        req.game.actions.append({
            action: 'move',
            position: req.body
        })

        try {
            await req.game.save();

            res.status(200).send('ok')
        } catch (e) {
            res.status(500).send(e)
        }
    }
}

module.exports.attackRequest = async (req, res) => {
    if (!req.game.doActionQueue) {
        const result = await attack(req.player, req.params.targetId)

        res.status(result.status).send(result.message)
    } else {
        req.game.actions.append({
            action: 'attack',
            targetId: req.params.targetId
        })
        try {
            await req.game.save();

            res.status(200).send('ok')
        } catch (e) {
            res.status(500).send(e)
        }
    }

}

module.exports.upgradeRequest = async (req, res) => {
    if (!req.game.doActionQueue) {
        const result = await upgrade(req.player, req.params.upgrade);

        res.status(result.status).send(result.message)
    } else {
        req.game.actions.append({
            action: 'upgrade',
            upgrade: req.params.upgrade
        })
        try {
            await req.game.save();

            res.status(200).send('ok')
        } catch (e) {
            res.status(500).send(e)
        }
    }
}

module.exports.giveRequest = async (req, res) => {
    if (!req.game.doActionQueue) {
        const result = await upgrade(req.player, req.params.targetId);

        res.status(result.status).send(result.message)
    } else {
        req.game.actions.append({
            action: 'give',
            targetId: req.params.targetId
        })

        try {
            await req.game.save();

            res.status(200).send('ok')
        } catch (e) {
            res.status(500).send(e)
        }
    }
}