const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
    user_id: mongoose.ObjectId,
    game_id: mongoose.ObjectId,
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
    }
});

const Player = mongoose.model("players", playerSchema);
module.exports = Player;