const Game = require('../models/GameModel.js')
const Player = require('../models/PlayerModel.js')
const { assignLocation } = require("../libs/game_utils.js");
const { createPlayer } = require("../libs/game_utils.js");


/**
 *
 * @param req POST form
 * @param res
 * @return {Promise<Document<any, any, unknown>>}
 */
module.exports.createGame = (req, res) => {
    const gameCfg = { ...req.body };

    // Append user id
    gameCfg.creator_id = req.user.id

    // Reformat and append size
    // todo: Custom sizes will require different setup
    gameCfg.size = { width: gameCfg.size, height: gameCfg.size }

    let gameId;
    return new Game(gameCfg).save()
        .then((doc) => new Player({
            user_id: req.user.id,
            game_id: gameId = doc._id,
            name: req.body.displayName !== '' ? req.body.displayName : req.user.username
        }).save())
        .then(() => res.redirect(`/game-created/${ gameId }`))
        .catch(err => {
            console.log(err)
            Game.deleteOne({ _id: gameId }).exec()
                .then(() => res.redirect('/create-game'));
            res.redirect('/game/create')
        });
}

/**
 *
 * @param req POST form
 * @param res
 */
module.exports.joinGame = function (req, res) {
    if (!req.user) res.status(403).send()

    const responseJson = req.body;

    createPlayer(req, responseJson.game_id)
        .then(() => res.send('Joined successfully!'))
        .catch(err => {
            console.log(err)
            res.redirect('/game/create')
        });
}

/**
 * Takes a gameId as a GET param and sends a game object with a list of player ids attached.
 * @param req GET
 * @param res
 */
module.exports.getGame = function (req, res) {
    const gameId = req.params.gameId

    let gameObject;

    Game.findById(gameId)
        .then(game =>
        {
            gameObject = game;
            return Player.find({game_id: game.id})
        })
        .then(players => {
            res.json({ game: gameObject, players: players })
        })
        .catch(err => res.status(500).send(err))
}

module.exports.getUserGames = async function (req, res) {
    const userId = req.user.id;

    const playerList = await Player.find({ user_id: userId })

    let gameList = []

    await Promise.all(playerList.map(player => Game.findById(player.game_id)))
        .then(games => gameList = games)

    res.json(gameList);
}

/**
 * Initializes all added player into random positions
 * @param req GET
 * @param res
 */
module.exports.initGame = async function (req, res) {
    const gameId = req.params.gameId

    const players = await Player.find({ game_id: gameId })
    const game = await Game.findOne({ _id: gameId })

    const locations = assignLocation(players.length, game.size)

    await Promise.all(players.map((player, i) => {
        player.position = locations[i];
        return player.save();
    }))
}