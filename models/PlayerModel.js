const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
    user_id: { type: mongoose.Types.ObjectId, required: true, ref: "Game" },
    game_id: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    name: {
        type: String,
        required: true
    },
    position: {
        x: Number,
        y: Number
    },
    actions: {
        type: Number,
        default: 1
    },
    range: {
        type: Number,
        default: 1
    },
    sight: {
        type: Number,
        default: 1
    },
    health: {
        type: Number,
        default: 3
    }
}, { timestamps: true });

const Player = mongoose.model("players", playerSchema);
module.exports = Player;