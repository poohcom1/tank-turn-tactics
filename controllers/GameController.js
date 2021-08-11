const Game = require('../models/GameModel.js')
const Player = require('../models/PlayerModel.js')
const { assignLocation } = require("../libs/game_utils.js");
const mongoose = require("mongoose");

// Base controllers

function sanitizePlayers(players, userId, hiddenFields = ['actions']) {
    players.forEach(p => {
        if (!p.user_id.equals(userId)) {
            hiddenFields.forEach(field => {
                delete p[field]
            })
        }
    })

    return players
}

// Request controllers

/**
 * Creates a game from the creation form
 * @param req POST form
 * @param res
 * @return {Promise<Document<any, any, unknown>>}
 */
module.exports.createGameRequest = async (req, res) => {
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

function createPlayerObject(name, game, user, data=[]) {
    return {
        name: name !== '' ? name : user.email,
        user_id: user.id,
        game_id: game._id,
        actions: game.actionsPerInterval,
        ...data
    }
}

/**
 * Adds current user to game
 * @param req POST form
 * @param res
 */
module.exports.joinGameRequest = async function (req, res) {
    if (!req.user) res.status(403).send()

    const responseJson = req.body;

    let game;
    let players;
    let player

    try {
        game = await Game.findById(responseJson.gameId)
    } catch (e) {
        return res.redirect('/join?error=nonexistent')
    }

    try {
        players = await Player.find({ game_id: responseJson.gameId })
        player = players.find(p => p.user_id.equals(req.user.id))
    } catch (e) {
        return res.status(501).send()
    }

    if (player) {
        console.log("Player already joined!")
        return res.redirect('/play?game=' + game._id)
    }

    if (game.hasStarted) {
        if (player && !game.allowAlwaysJoin) {
            return res.redirect('/play?game=' + responseJson.gameId)
        } else if (game.allowAlwaysJoin && players.filter(p => p.health > 0).length > 1) {
            const positions = players.map(p => p.position)

            const position = assignLocation(1, game.size, positions)[0];

            await new Player(createPlayerObject(responseJson.displayName, game, req.user, { position })).save()

            return res.redirect('/play?game=' + responseJson.gameId)
        } else {
            return res.redirect('/join?error=gameStarted')
        }
    }


    try {
        await new Player(createPlayerObject(responseJson.displayName, game, req.user)).save()

        res.redirect('/play?game=' + responseJson.gameId)
    } catch (e) {
        console.log(e)
        res.redirect('/join?error=server')
    }
}

// GET routes with

async function getGame(gameId, userId) {
    const game = await Game.findById(gameId).lean();
    game.players = await Player.find({ game_id: game._id }).lean();
    sanitizePlayers(game.players, userId)
    game.user_id = userId;

    return game;
}

module.exports.getGame = getGame

/**
 * Takes a gameId as a GET param and sends a game object with a list of player ids attached.
 * @param req GET
 * @param {number} req.params.gameId Game ID
 * @param res
 */
module.exports.getGameRequest = async function (req, res) {
    const gameId = req.params.gameId

    try {
        const game = await getGame(gameId, req.user.id)

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
module.exports.startGameRequest = async function (req, res) {
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
        startedAt: new Date()
    })

    res.redirect("/play?game=" + gameId)
}

module.exports.getPlayerRequest = async function (req, res) {
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
        userPlayerList.map(player => Game.findById(player.game_id).lean())
    )

    for (let i = gameList.length - 1; i >= 0; i--) {
        const game = gameList[i];

        // Check for missing game objects
        if (!game) {
            const players = await Player.find({})

            const deletedGameIds = new Set()

            for (const player of players) {
                const game = await Game.findById(player.game_id)

                if (!game) {
                    deletedGameIds.add(player.game_id)
                }
            }

            await Player.deleteMany({
                'game_id': { $in: Array.from(deletedGameIds)}
            })

            gameList.splice(i, 1)
        }
    }

    return await joinGamesWithPlayer(gameList, userId)
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
 * @param userId
 * @return {Promise<Game[]>}
 */
async function joinGamesWithPlayer(gameObjects, userId) {
    return await Promise.all(gameObjects.map(
        async game => {

            game.players = [];
            game.players = sanitizePlayers(await Player.find({ game_id: mongoose.Types.ObjectId(game._id) }).lean(), userId );

            return game;

        }
    ))
}


async function deleteGame(gameId) {
    try {
        await Player.deleteMany({ game_id: gameId })
        await Game.findByIdAndDelete(gameId)

        return { status: 200, message: 'ok' }
    } catch (e) {
        return { status: 501, message: e }
    }
}

module.exports.deleteGame = deleteGame;

// Admin
module.exports.deleteGameRequest = async function (req, res) {
    const gameId = req.params.gameId;

    const results = await deleteGame(gameId)

    return res.status(results.status).send(results.message)
}

module.exports.getAllGamesRequest = async function (req, res) {
    const gameList = await Game.find().lean()

    res.json(await joinGamesWithPlayer(gameList))
}

module.exports.renamePlayerRequest = async function (req, res) {
    try {
        const name = req.params.name

        const player = await Player.findOne({ game_id: req.params.gameId, user_id: req.user.id });

        player.name = name;

        await player.save()

        res.sendStatus(200)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
}

module.exports.editGameRequest = async function (req, res) {

}