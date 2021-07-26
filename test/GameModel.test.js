const DBHandler = require('./db_handler');
const Game = require('../models/GameModel.js')

let dbHandler;

// Connect to a new in-memory database before running any tests.
beforeAll(async () => {
        dbHandler = await DBHandler.init()
        await dbHandler.connect()
    });

// Clear all test data after every test.
afterEach(async () => await dbHandler.clearDatabase());

// Remove and close the db and server.
afterAll(async () => await dbHandler.closeDatabase());

describe("GameController", () => {
    it("Should add a new game to the db with createGame", async () => {
        const name = `Test game: ${Math.random()}`;

        const game = new Game({
            name: name,
            size: { width: 10, height: 10 }
        })

        const doc = await game.save();

        const fetchedGame = await Game.findById(doc._id)

        expect(fetchedGame.name).toBe(name)
    })

    it("Should fetch all games given a player id", async () => {

    })
})