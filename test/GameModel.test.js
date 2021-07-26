const DBHandler = require('./db_handler');
const mongoose = require('mongoose')
const Game = require('../models/GameModel.js')

DBHandler.setup();

describe("GameModel", () => {
    it("Should add a new game to the db with createGame", async () => {
        const name = `Test game: ${Math.random()}`;

        const game = new Game({
            name: name,
            size: { width: 10, height: 10 },
            creator_id: mongoose.Types.ObjectId()
        })

        const doc = await game.save();

        const fetchedGame = await Game.findById(doc._id)

        expect(fetchedGame.name).toBe(name)
    })
})