const Game = require('../models/GameModel.js')
const Player = require('../models/PlayerModel.js')
const { assignLocation } = require("../libs/game_utils.js");
const mongoose = require("mongoose");

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
            name: req.body.displayName !== '' ? req.body.displayName : req.user.email,
            actions: gameCfg.actionsPerInterval
        }).save()

        res.redirect(`/play?game=${ gameId }`)
    } catch (e) {
        console.log(e)

        // If error is thrown
        if (gameId) {
            await Game.deleteOne({ _id: gameId }).exec()
        }

        res.redirect('/create-game')
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

    let game;
    let player

    try {
        game = await Game.findById(responseJson.gameId)
        player = await Player.findOne({ game_id: responseJson.gameId, user_id: req.user.id })
    } catch (e) {
        return res.redirect('/join?error=nonexistent')
    }

    if (game.hasStarted) {
        if (player) {
            return res.redirect('/play?game=' + responseJson.gameId)
        } else {
            return res.redirect('/join?error=gameStarted')
        }
    }

    const existingPlayers = await Player.find({ user_id: req.user.id, game_id: game._id })

    if (existingPlayers && existingPlayers.length > 0) {
        console.log("Player already joined!")
        return res.redirect('/play?game=' + game._id)
    }

    try {
        await new Player({
            name: responseJson.displayName !== '' ? responseJson.displayName : req.user.email,
            user_id: req.user.id,
            game_id: responseJson.gameId,
            actions: game.actionsPerInterval
        }).save()

        res.redirect('/play?game=' + responseJson.gameId)
    } catch (e) {
        console.log(e)
        res.redirect('/join?error=server')
    }
}

// GET routes with params

/**
 * Takes a gameId as a GET param and sends a game object with a list of player ids attached.
 * @param req GET
 * @param {number} req.params.gameId Game ID
 * @param res
 */
module.exports.getGame = async function (req, res) {
    const gameId = req.params.gameId

    try {
        const game = await Game.findById(gameId).lean();
        game.players = await Player.find({ game_id: game._id });
        game.user_id = req.user.id;

        res.json(game)
    } catch (e) {
        res.status(500).send(e)
    }
}


/**
 * Initializes all added player into random positions
 * @param req GET
 * @param {number} req.params.gameId Game ID
 * @param res
 */
module.exports.startGame = async function (req, res) {
    const gameId = req.params.gameId

    // Fetch game and its players
    const players = await Player.find({ game_id: gameId })
    const game = await Game.findOne({ _id: gameId })


    const locations = assignLocation(players.length, game.size)

    await Promise.all(players.map((player, i) => {
        player.position = locations[i];
        return player.save();
    }))

    await Game.findByIdAndUpdate(gameId, {
        hasStarted: true,
        actionsPerDay: 2,
        startedAt: new Date()
    })

    res.redirect("/play?game=" + gameId)
}

module.exports.getPlayer = async function (req, res) {
    const gameId = req.params.gameId

    const player = await Player.find({ user_id: req.user.id, game_id: gameId })

    if (player[0])
        res.json(player[0])
    else
        res.status(500).send()
}

module.exports.getPlayers = async function (req, res) {
    const gameId = req.params.gameId

    const players = await Player.find({ game_id: gameId }).lean()

    res.send(players)
}

// GET routes

async function getUserGames(userId) {
    const userPlayerList = await Player.find({ user_id: mongoose.Types.ObjectId(userId) })

    const gameList = await Promise.all(
        userPlayerList.map( player => Game.findById(player.game_id).lean() )
    )

    return await joinGamesWithPlayer(gameList)
}

module.exports.getUserGames = getUserGames

/**
 * Get all games belonging to the current user
 * @param req
 * @param res
 */
module.exports.getUserGamesRequest = async function (req, res) {
    res.json(await getUserGames(req.user.id));
}

/**
 * Appends all a games player to the game as 'players'
 * @param gameObjects
 * @return {Promise<Game[]>}
 */
async function joinGamesWithPlayer(gameObjects) {
     return await Promise.all(gameObjects.map(
        async game => {
            game.players = [];
            game.players = await Player.find({ game_id: mongoose.Types.ObjectId(game._id) });

            return game;
        }
    ))
}


// Admin
module.exports.deleteGame = async function (req, res) {
    const gameId = req.params.gameId;

    try {
        await Player.deleteMany({ game_id: gameId })
        await Game.findByIdAndDelete(gameId)

        res.sendStatus(200)
    } catch (e) {
        res.send(e)
    }
}

module.exports.getAllGames = async function (req, res) {
    const gameList = await Game.find().lean()

    res.json(await joinGamesWithPlayer(gameList))
}