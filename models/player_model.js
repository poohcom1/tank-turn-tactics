const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
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