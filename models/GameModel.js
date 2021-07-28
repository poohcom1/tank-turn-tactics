const mongoose = require("mongoose");

/**
 * @typedef GameSchema
 * @property {string} name required
 * @property {string} password required
 * @property {Object} size
 * @property {number} size.width
 * @property {number} size.height
 * @property {number} actionsPerDay
 * @property {number} actionsPerInterval
 * @property {number} tieCount
 * @property {boolean} allowVoteChange
 * @property {boolean} doActionQueue
 * @property {boolean} doBroadcastAction
 * @property {boolean} doFogOfWar
 * @property {boolean} doBounty
 * @property {boolean} doEscort
 */
const schemaObject = {
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
    creator_id: { type: mongoose.Types.ObjectId, required: true },

    hasStarted: { type: Boolean, default: false },
    startedAt: { type: Date },

    // Game options
    actionsPerDay: { type: Number, default: 1 },
    actionsPerInterval: { type: Number, default: 1 },
    tieCount: { type: Number, default: 2 },

    allowAlwaysJoin: { type: Boolean, default: false },

    allowVoteChange: { type: Boolean, default: true },

    doActionQueue: { type: Boolean, default: true },
    doBroadcastAction: { type: Boolean, default: true },

    doFogOfWar: { type: Boolean, default: true },
    doBounty: { type: Boolean, default: true },
    doEscort: { type: Boolean, default: false }
}


const gameSchema = new mongoose.Schema(schemaObject, { timestamps: true });

const Game = mongoose.model("games", gameSchema)
module.exports = Game;