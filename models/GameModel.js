const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
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
    players: {
        type: [mongoose.ObjectId],
        default: []
    },

    // Game options
    actionsPerDay: { type: Number, default: 1 },
    actionsPerInterval: { type: Number, default: 1 },
    tieCount: { type: Number, default: 2 },

    allowVoteChange: Boolean,

    doActionQueue: Boolean,
    doBroadcastAction: Boolean,

    doFogOfWar: Boolean,
    doBounty: Boolean,
    doEscort: Boolean
});

const Game = mongoose.model("games", gameSchema)
module.exports = Game;