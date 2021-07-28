const mongoose = require('mongoose')

const ActionSchema = new mongoose.Schema({
    player_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    actionPoints: {
        type: Number,
        default: 1
    }
}, { timestamps: true })

const actionArray = ActionSchema.path('actions')

const MoveSchema = actionArray.discriminators('Move', new mongoose.Schema({

}))
