const DBHandler = require('./db_handler');
const mongoose = require('mongoose')
const { getMockReq, getMockRes } = require('@jest-mock/express')
const Game = require('../models/GameModel.js')
const Player = require('../models/PlayerModel.js')
const { attackReq, moveReq, isAdjacent, voteReq } = require("../controllers/ActionController.js");

DBHandler.setup();

const defaultPlayerData = {
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
            mainPlayer = await new Player(defaultPlayerData).save();

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
                        y: defaultPlayerData.position.y
                    },
                    {
                        x: 3,
                        y: defaultPlayerData.position.y
                    }
                ]
            }
            req.player.actions = 100;
            req.game = defaultGameImmediate

            const { res } = getMockRes();

            await moveReq(req, res);

            expect(res.status).toHaveBeenCalledWith(403)
        })

        it("prevent movement to negative boxes", async () => {
            req.body = {
                positions: [ {
                    x: -1,
                    y: defaultPlayerData.position.y
                } ]
            }
            req.game = defaultGameImmediate

            const { res } = getMockRes();

            await moveReq(req, res);

            expect(res.status).toHaveBeenCalledWith(403)
        })

        it("prevent movement outside of grid", async () => {
            const playerOnGridEdge = new Player({
                ...defaultPlayerData,
                range: 100
            })

            req = {
                body: {
                    positions: [ {
                        x: defaultGameImmediate.size.width,
                        y: defaultPlayerData.position.y
                    } ]
                },
                game: defaultGameImmediate
            }

            const { res } = getMockRes();

            await moveReq({ ...req, player: playerOnGridEdge }, res);

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

            mainPlayer = await new Player(defaultPlayerData).save();

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

            await attackReq(req, res);

            const fetchedMainPlayer = await Player.findById(mainPlayer._id)

            expect(fetchedMainPlayer.actions).toBe(defaultPlayerData.actions - 1);
        })

        it("should consume the right amount of action points", async () => {
            const { res } = getMockRes();
            req.params.count = 2

            await attackReq(req, res);

            const fetchedMainPlayer = await Player.findById(mainPlayer._id)

            expect(fetchedMainPlayer.actions).toBe(defaultPlayerData.actions - req.params.count);
        })

        it("should reduce the target health by 1", async () => {
            const { res } = getMockRes();

            await attackReq(req, res);

            const fetchedTargetPlayer = await Player.findById(targetPlayer._id)

            expect(fetchedTargetPlayer.health).toBe(targetPlayer.health - 1);
        })
    })

    describe("votes", () => {
        it("should return an error if voting type does not exist", async () => {
            const game = await new Game({ ...defaultGameImmediate })
            const votingPlayer = await new Player({...defaultPlayerData, game_id: game._id, user_id: mongoose.Types.ObjectId(), health: 0}).save();
            const votedPlayer = await new Player({...defaultPlayerData, game_id: game._id, user_id: mongoose.Types.ObjectId(), health: 1}).save()

            const req = {
                game: game,
                player: votingPlayer,
                params: {
                    playerId: votedPlayer._id,
                    vote: "somethinqwrewrg"
                }
            }

            const { res } = getMockRes()

            await voteReq(req, res)

            expect(res.send).toHaveBeenCalledWith(voteReq.voteTypeError)
        })

      describe("juryVote", () => {
          let game;
          let votingPlayer;
          let votedPlayer;

          let req;
          let mockRes;

          beforeEach(async () => {
              game = await new Game({ ...defaultGameImmediate })
              votingPlayer = await new Player({...defaultPlayerData, game_id: game._id, user_id: mongoose.Types.ObjectId(), health: 0}).save();
              votedPlayer = await new Player({...defaultPlayerData, game_id: game._id, user_id: mongoose.Types.ObjectId(), health: 1}).save()

              req = {
                  game: game,
                  player: votingPlayer,
                  params: {
                      playerId: votedPlayer._id,
                      vote: "vote_jury"
                  }
              }

              const { res } = getMockRes()

              mockRes = res;
          })

          it("should set the vote", async () => {
              await voteReq(req, mockRes)

              expect( ( await Player.findById(votingPlayer._id) ).vote_jury ).toStrictEqual(votedPlayer._id)
          })

          it("should prevent vote if the voting player is alive", async() => {
              req = {
                  ...req,
                  player: { ...votingPlayer, health: 1 },
              }

              await voteReq(req, mockRes)

              expect(mockRes.send).toHaveBeenCalledWith(voteReq.playerDeadError)
          })

          it("should prevent vote if the voted player is dead", async() => {
              const deadVotedPlayer = await new Player({ ...defaultPlayerData, game_id: game._id, health: 0 }).save();

              req = {
                  ...req,
                  params: {
                      ...req.params,
                      playerId: deadVotedPlayer._id
                  }
              }

              await voteReq(req, mockRes)

              expect(mockRes.send).toHaveBeenCalledWith(voteReq.playerDeadError)
          })
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
            mainPlayer = await new Player(defaultPlayerData).save();

            req = {
                player: mainPlayer,
                game: game,
                params: { x: 10, y: 10}
            }
        })

        it.todo("Test queued type actions")
    })
})