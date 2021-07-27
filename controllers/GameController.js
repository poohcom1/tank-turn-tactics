const Game = require('../models/GameModel.js')
const Player = require('../models/PlayerModel.js')
const { assignLocation } = require("../libs/game_utils.js");

// Form routes

/**
 * Creates a game from the creation form
 * @param req POST form
 * @param res
 * @return {Promise<Document<any, any, unknown>>}
 */
module.exports.createGame = async (req, res) => {
    const gameCfg = { ...req.body };

    // Append user id
    gameCfg.creator_id = req.user.id

    // Reformat and append size
    // todo: Custom sizes will require different setup
    gameCfg.size = { width: gameCfg.size, height: gameCfg.size }

    let gameId;

    try {
        gameId = (await new Game(gameCfg).save())._id;

        await new Player({
            user_id: req.user.id,
            game_id: gameId,
            name: req.body.displayName !== '' ? req.body.displayName : req.user.username
        }).save()

        res.redirect(`/game-created/${ gameId }`)
    } catch (e) {
        // console.log(e)

        // If error is thrown
        if (gameId) {
            Game.deleteOne({ _id: gameId }).exec()
                .then(() => res.redirect('/create-game'));
        }

        res.redirect('/game/create')
    }
}

/**
 * Adds current user to game
 * @param req POST form
 * @param res
 */
module.exports.joinGame = async function (req, res) {
    if (!req.user) res.status(403).send()

    const responseJson = req.body;

    try {
        await new Player({
            name: responseJson.displayName !== '' ? responseJson.displayName : req.user.username,
            user_id: req.user.id,
            game_id: responseJson.gameId
        }).save()

        res.send('Join successfully!')
    } catch (e) {
        console.log(e)
        res.redirect('/join')
    }
}

// GET routes with params

/**
 * Takes a gameId as a GET param and sends a game object with a list of player ids attached.
 * @param req GET
 * @param {number} req.params.gameId Game ID
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


/**
 * Initializes all added player into random positions
 * @param req GET
 * @param {number} req.params.gameId Game ID
 * @param res
 */
module.exports.initGame = async function (req, res) {
    const gameId = req.params.gameId

    // Fetch game and its players
    const players = await Player.find({ game_id: gameId })
    const game = await Game.findOne({ _id: gameId })

    const locations = assignLocation(players.length, game.size)

    await Promise.all(players.map((player, i) => {
        player.position = locations[i];
        return player.save();
    }))
}

// GET routes

/**
 * Game all games belonging to the current user
 * @param req
 * @param res
 */
module.exports.getUserGames = async function (req, res) {
    const userId = req.user.id;

    const userPlayerList = await Player.find({ user_id: userId })

    const gameList = await Promise.all(userPlayerList.map(player => Game.findById(player.game_id).lean()))

    const players = await Player.find({ game_id: { $in: gameList.map(game => game._id) }})

    gameList.map(game => game.players = [])

    players.forEach(player => gameList.filter(game => game._id.toString() === player.game_id.toString())[0].players.push(player))

    res.json(gameList);
}