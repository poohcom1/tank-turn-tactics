const express = require("express");
const path = require("path");
require('dotenv').config();
const mysql = require("mysql");

const app = express()

// Serve pages
app.use(express.static(path.join(__dirname, 'public')))

/* --------------------------------- Database ------------------------------- */
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'tank_tactics'
});

connection.connect();

/* -------------------------------- Rest API -------------------------------- */

// Game data

/**
 * Get grid size for session
 */
app.get("/grid-size", (req, res) => {
    res.send({ width: 10, height: 10 })
})

/**
 * Get players
 */
app.get("/players", (req, res) => {
    const players = connection.query("SELECT * FROM player", (err, results, fields) => {
        if (err) res.status(500);

        res.send(results);
    })
})


/**
 * Get 
 */

// Game actions

// Game creation

/**
 * @typedef {Object} Game
 * @property {number} width
 * @property {number} height
 * @property {array} players
 */


/**
 * @typedef {Object} Player
 * @property {string} name
 * @property {number} x
 * @property {number} y
 * @property {number} health
 * @property {number} actions
 * @property {number} range
 */

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`))