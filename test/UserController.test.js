const DBHandler = require('./db_handler');
const mongoose = require('mongoose')
const { getMockReq, getMockRes } = require('@jest-mock/express')
const User = require('../models/UserModel.js')
const { getUser } = require('../controllers/UserController.js')

DBHandler.setup();

describe("GameController", () => {
    describe("getUser", () => {
        it("Should retrieve the right user", async () => {
            const req = {
                user: {
                    id: mongoose.Types.ObjectId()
                }
            };

            const { res } = getMockRes()

            await getUser(req, res);

            expect(res.send).toHaveBeenCalledWith(req.user.id)
        })
    })
})