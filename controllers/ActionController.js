// All routes to game will have req.game and req.player

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
            res.status(500).send(e)
        }
    } else {
        res.status(500).send("Out of bounds")
    }
}

module.exports.attack = async (req, res) => {

}