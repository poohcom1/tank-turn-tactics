require('dotenv').config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose")

// Models
const User = require("./models/user.js")


const app = express()

// Serve pages
app.use(express.static(path.join(__dirname, 'public')))

/* --------------------------------- Database ------------------------------- */
const dbUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true})
    .then(res => {
        console.log("Connected to database");
        /* App started here */
        app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
    })
    .catch(err => console.log("[Database error] " + err));

function addUser(username, uid) {
    const user = new User({
        username: username,
        uid: uid
    })

    user.save();
}


/* ---------------------------------- Auth ---------------------------------- */

/* -------------------------------- Rest API -------------------------------- */

// Auth
app.get('/add-user', (req, res) => {

})


// Game data

/**
 * Get grid size for session
 */
app.get("/grid-size", (req, res) => {
    res.send({ width: 10, height: 10 })
})

/**
 * Get players (dummy function currently)
 */
app.get("/players", (req, res) => {

})


// Game actions

app.get("/move", (req, res) => {

})

// Game creation -- Schemas

/**
 * @typedef {Object} Game
 * @property {number} id
 * @property {number} width
 * @property {number} height
 * @property {array<Player.id>} players
 */


/**
 * @typedef {Object} Player
 * @property {number} id
 * @property {number} game_id Foreign key of game table
 * @property {string} name
 * @property {number} x
 * @property {number} y
 * @property {number} health
 * @property {number} actions
 * @property {number} range
 */

