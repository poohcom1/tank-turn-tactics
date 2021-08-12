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
    // Must match enum name in GameModel.js!
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
    },
    color: {
        type: String,
        default: "#00ffc3"
    },

    // Votes
    vote_jury: {
        type: mongoose.Types.ObjectId,
        ref: "Player"
    }
}, { timestamps: true });

playerSchema.index({ 'user_id': 1, 'game_id':1 }, { unique: true})

const Player = mongoose.model("players", playerSchema);
module.exports = Player;