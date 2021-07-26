const Game = require('../models/GameModel.js')
const mongoose = require('mongoose')
const { createPlayer } = require("./PlayerController.js");


module.exports.createGame = (req, res) => {
    if (!req.user) res.status(501).send()

    const gameCfg = req.body;

    gameCfg.size = { width: gameCfg.size, height: gameCfg.size }

    new Game(gameCfg).save()
        .then((doc) => {
            const game_id = doc._id;

            createPlayer(req.user.id, game_id, gameCfg.displayName ?? req.user.username)
                .then(() => res.redirect(`/game-created/${doc._id}`))
                .catch(err => {
                    console.log(err)
                    res.redirect('/create-game');
                })
        })
        .catch(err => {
            console.log(err)
            res.redirect('/game/create')
        });
}