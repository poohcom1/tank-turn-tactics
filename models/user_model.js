const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    uid: {
        type: String,
        required: true
    }
})

const User = mongoose.model("users", userSchema);
module.exports = User;