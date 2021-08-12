const mongoose = require('mongoose')

const ActionSchema = new mongoose.Schema({
    action: { type: String, enum: ['attack', 'move', 'upgrade', 'give', 'vote'], required: true },

    // Attack/Give
    player_id: { type: mongoose.Types.ObjectId, ref: "Player"},
    // Attack/Give
    target_id: mongoose.Types.ObjectId,
    killed: { type: Boolean, default: false },

    // Move
    positions: [{
        x: Number,
        y: Number
    }],

    // Upgrade
    upgrade: { type: String, enum: ['range', 'sight', 'health'] },

    // Vote (target_id empty when tied)
    vote: { type: String, enum: ['jury']},
    vote_tied: Boolean

}, { timestamps: true })

module.exports = ActionSchema;