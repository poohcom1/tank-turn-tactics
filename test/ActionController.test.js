const DBHandler = require('./db_handler');
const mongoose = require('mongoose')
const { getMockReq, getMockRes } = require('@jest-mock/express')
const Game = require('../models/GameModel.js')
const Player = require('../models/PlayerModel.js')
const { attackRequest, moveRequest, isAdjacent } = require("../controllers/ActionController.js");

DBHandler.setup();

const mainPlayerData = {
    name: "Player",
    position: { x: 0, y: 0 },
    user_id: mongoose.Types.ObjectId(),
    game_id: mongoose.Types.ObjectId(),
    range: 1,
    actions: 3
}

const defaultGameImmediate = {
    name: "Test game",
    size: { width: 10, height: 10 },
    doActionQueue: false,
    actions: [],
    actionLog: []
}

describe("ActionController: Immediate", () => {
    describe('isAdjacent', function () {
        it("should be true for adjacent x", () => {
            expect(isAdjacent({ x: 0, y: 0 }, { x: 1, y: 0 })).toBeTruthy()
        })
        it("should be true for adjacent y", () => {
            expect(isAdjacent({ x: 0, y: 1 }, { x: 0, y: 0 })).toBeTruthy()
        })
        it("should be false for diagonals", () => {
            expect(isAdjacent({ x: 0, y: 0 }, { x: 1, y: 1 })).toBeFalsy()
        })
        it("should be false for positions more than one apart", () => {
            expect(isAdjacent({ x: 0, y: 0 }, { x: 0, y: 2 })).toBeFalsy()
        })
    });
    describe("move", () => {
        let mainPlayer;
        let req;
        beforeEach(async () => {
            mainPlayer = await new Player(mainPlayerData).save();

            req = {
                player: mainPlayer,
                game: defaultGameImmediate
            }
        })

        it("prevent skips in path", async () => {
            req.body = {
                positions: [
                    {
                        x: 2,
                        y: mainPlayerData.position.y
                    },
                    {
                        x: 3,
                        y: mainPlayerData.position.y
                    }
                ]
            }
            req.player.actions = 100;
            req.game = defaultGameImmediate

            const { res } = getMockRes();

            await moveRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(403)
        })

        it("prevent movement to negative boxes", async () => {
            req.body = {
                positions: [ {
                    x: -1,
                    y: mainPlayerData.position.y
                } ]
            }
            req.game = defaultGameImmediate

            const { res } = getMockRes();

            await moveRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(403)
        })

        it("prevent movement outside of grid", async () => {
            const playerOnGridEdge = new Player({
                ...mainPlayerData,
                range: 100
            })

            req = {
                body: {
                    positions: [ {
                        x: defaultGameImmediate.size.width,
                        y: mainPlayerData.position.y
                    } ]
                },
                game: defaultGameImmediate
            }

            const { res } = getMockRes();

            await moveRequest({ ...req, player: playerOnGridEdge }, res);

            expect(res.status).toHaveBeenCalledWith(403)
        })
    })

    describe("attack", () => {
        let mainPlayer;
        let targetPlayer;
        let req;
        beforeEach(async () => {
            targetPlayer = await new Player({
                name: "test", position: { x: 0, y: 1 }, user_id: mongoose.Types.ObjectId(),
                game_id: mongoose.Types.ObjectId()
            }).save()

            mainPlayer = await new Player(mainPlayerData).save();

            req = {
                player: mainPlayer,
                params: {
                    targetId: targetPlayer._id,
                    count: 1
                },
                game: defaultGameImmediate
            }
        })

        it("should consume one action point", async () => {
            const { res } = getMockRes();

            await attackRequest(req, res);

            const fetchedMainPlayer = await Player.findById(mainPlayer._id)

            expect(fetchedMainPlayer.actions).toBe(mainPlayerData.actions - 1);
        })

        it("should consume the right amount of action points", async () => {
            const { res } = getMockRes();
            req.params.count = 2

            await attackRequest(req, res);

            const fetchedMainPlayer = await Player.findById(mainPlayer._id)

            expect(fetchedMainPlayer.actions).toBe(mainPlayerData.actions - req.params.count);
        })

        it("should reduce the target health by 1", async () => {
            const { res } = getMockRes();

            await attackRequest(req, res);

            const fetchedTargetPlayer = await Player.findById(targetPlayer._id)

            expect(fetchedTargetPlayer.health).toBe(targetPlayer.health - 1);
        })
    })
})

const defaultGameQueued = {
    name: "Test game",
    size: { width: 10, height: 10 },
    doActionQueue: true,
    actions: []
}

describe("ActionController: Queue", () => {
    let game;

    beforeEach(async () => {
        game = await new Game(defaultGameQueued).save();
    })

    describe("move", () => {
        let mainPlayer;
        let req;

        beforeEach(async () => {
            mainPlayer = await new Player(mainPlayerData).save();

            req = {
                player: mainPlayer,
                game: game,
                params: { x: 10, y: 10}
            }
        })

        it.todo("Test queued type actions")
    })
})