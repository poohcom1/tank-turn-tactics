const DBHandler = require('./db_handler');
const mongoose = require('mongoose')
const { getMockReq, getMockRes } = require('@jest-mock/express')
const Game = require('../models/GameModel.js')
const Player = require('../models/PlayerModel.js')

DBHandler.setup();

describe("ActionController", () => {
    describe("move", () => {
        it.todo("Check actions count and bounds")
    })
})