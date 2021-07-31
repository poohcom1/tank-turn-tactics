const mongoose = require('mongoose')

const ActionSchema = new mongoose.Schema({
    action: { type: String, enum: ['attack', 'move', 'upgrade', 'give'], required: true },
    player: { type: mongoose.Types.ObjectId, ref: "Player", required: true},

    target_id: mongoose.Types.ObjectId,
    position: {
        x: Number,
        y: Number
    },
    upgrade: { type: String, enum: ['range', 'sight', 'health'] }
}, { timestamps: true })

module.exports = ActionSchema;