const mongoose = require("mongoose");

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
    actionsPerDay: { type: Number, default: 1 },
    actionsPerInterval: { type: Number, default: 1 },
    tieCount: { type: Number, default: 2 },

    allowAlwaysJoin: { type: Boolean, default: false },

    allowVoteChange: { type: Boolean, default: true },

    doActionQueue: { type: Boolean, default: false },
    doBroadcastAction: { type: Boolean, default: true },

    doFogOfWar: { type: Boolean, default: true },
    doBounty: { type: Boolean, default: true },
    doEscort: { type: Boolean, default: false }
}, { timestamps: true });


const Game = mongoose.model("games", gameSchema)

module.exports = Game;