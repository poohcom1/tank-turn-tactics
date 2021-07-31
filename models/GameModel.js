const mongoose = require('mongoose');
const ActionSchema = require('./ActionSchema.js')

const gameSchema = new mongoose.Schema({
    // Properties
    name: {
        type: String,
        required: true
    },
    size: {
        width: {
            type: Number,
            required: true
        },
        height: {
            type: Number,
            required: true
        }
    },
    password: String,
    creator_id: { type: mongoose.Types.ObjectId, required: true, ref: "User" },

    // Fields
    hasStarted: { type: Boolean, default: false },
    startedAt: { type: Date },

    // Game options
    turnTime: { type: Number, default: 12 },
    turnTimePassed: { type: Number, default: 0},

    actionsPerInterval: { type: Number, default: 1 },
    tieCount: { type: Number, default: 2 },

    allowAlwaysJoin: { type: Boolean, default: false },
    allowVoteChange: { type: Boolean, default: false },

    doActionQueue: { type: Boolean, default: false },
    doBroadcastAction: { type: Boolean, default: true },

    doFogOfWar: { type: Boolean, default: true },
    doBounty: { type: Boolean, default: true },
    doEscort: { type: Boolean, default: false },

    actions: [ActionSchema],
    actionLog: [ActionSchema]
}, { timestamps: true });

const Game = mongoose.model("games", gameSchema)

module.exports = Game;