const DBHandler = require('./db_handler');
const mongoose = require('mongoose')
const { getMockReq, getMockRes } = require('@jest-mock/express')
const Game = require('../models/GameModel.js')
const Player = require('../models/PlayerModel.js')
const { attackRequest, moveRequest } = require("../controllers/ActionController.js");

DBHandler.setup();

const mainPlayerData = {
    name: "Player",
    position: { x: 0, y: 0 },
    user_id: mongoose.Types.ObjectId(),
    game_id: mongoose.Types.ObjectId(),
    range: 1,
    actions: 1
}

const defaultGameImmediate = {
    name: "Test game",
    size: { width: 10, height: 10 },
    doActionQueue: false,
    actions: [],
    actionLog: []
}

describe("ActionController: Immediate", () => {
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

        it("prevent movement outside of range", async () => {
            req.params = {
                x: mainPlayerData.position.x + mainPlayerData.range + 1,
                y: mainPlayerData.position.y
            }

            const { res } = getMockRes();

            await moveRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(403)
        })

        it("prevent movement to negative boxes", async () => {
            req.params = {
                x: -1,
                y: mainPlayerData.position.y
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
                params: {
                    x: defaultGameImmediate.size.width,
                    y: mainPlayerData.position.y
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
                    targetId: targetPlayer._id
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

// describe("ActionController: Queue", () => {
//     let game;
//
//     beforeEach(async () => {
//         game = await new Game(defaultGameQueued).save();
//     })
//
//     describe("move", () => {
//         let mainPlayer;
//         let req;
//
//         beforeEach(async () => {
//             mainPlayer = await new Player(mainPlayerData).save();
//
//             req = {
//                 player: mainPlayer,
//                 game: game,
//                 params: { x: 10, y: 10}
//             }
//         })
//     })
// })