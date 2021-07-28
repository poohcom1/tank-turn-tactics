
// All routes to game will have req.game and req.player

const Player = require("../models/PlayerModel.js");

function checkRange(position, target, range) {
    return Math.abs(position.x - target.x) <= range && Math.abs(position.y - target.y) <= range
}

module.exports.move = async (req, res) => {
    if (req.body.x >= 0
        && req.body.y >= 0
        && req.body.x <= req.game.size.width
        && req.body.y <= req.game.size.height
        && checkRange(req.player.position, req.body, req.player.range)) {

        try {
            await req.player.updateOne({
                position: {
                    x: req.body.x,
                    y: req.body.y
                },
                actions: req.player.actions-1
            })

            res.status(200).send()
        } catch (e) {
            console.log("[Action]", e)
            res.status(500).send(e)
        }
    } else {
        console.log("[Action] Out of bounds")
        res.status(500).send("Out of bounds")
    }
}

module.exports.attack = async (req, res) => {
    const targetId = req.params.targetId;

    let targetPlayer = await Player.findById(targetId);

    if (!checkRange(req.player.position, targetPlayer.position, req.player.range)) {
        return res.status(401).send()
    }

    try {
        if (targetPlayer.health > 0) {
            targetPlayer.health -= 1;
            await targetPlayer.updateOne(targetPlayer);
        }

        await req.player.updateOne({
            actions: req.player.actions-1
        })

        console.log(targetPlayer.name, "is now at", targetPlayer.health, "hp")

        res.status(200).send()
    } catch (e) {
        await targetPlayer.updateOne(targetPlayer)

        await req.player.updateOne(req.player)
    }
}

module.exports.upgrade = async (req, res) => {
    const UPGRADES = ["range", "sight"]

    if (!UPGRADES.includes(req.params.upgrade)) {
        res.status(401)
        return;
    }

    try {
        req.player[req.params.upgrade]++;

        await req.player.updateOne(req.player)

        res.status(200).send();
    } catch (e) {
        res.status(501).send(e);
    }
}
