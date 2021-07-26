const Game = require('../models/GameModel.js')
const Player = require('../models/PlayerModel.js')
const mongoose = require('mongoose')


module.exports.createGame = (req, res) => {
    if (!req.user) res.status(403).send()

    const gameCfg = req.body;

    gameCfg.creator_id = req.user.id
    gameCfg.size = { width: gameCfg.size, height: gameCfg.size }

    console.log(req.body.displayName)

    new Game(gameCfg).save()
        .then((doc) => {
            const game_id = doc._id;

            new Player({
                user_id: req.user.id,
                game_id: game_id,
                name: req.body.displayName !== '' ? req.body.displayName : req.user.username
            }).save()
                .then(() => res.redirect(`/game-created/${doc._id}`))
                .catch(err => {
                    console.log(err)
                    Game.deleteOne({ _id: game_id}).exec()
                        .then(() => res.redirect('/create-game'));
                })
        })
        .catch(err => {
            console.log(err)
            res.redirect('/game/create')
        });
}