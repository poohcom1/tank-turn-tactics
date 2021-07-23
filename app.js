const express = require("express")
const path = require("path")

const app = express()

// Serve pages
app.use(express.static(path.join(__dirname, 'public')))

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

/**
 * Get 
 */

// Game actions

// Game creation

/**
 * @typedef {Object} Game
 * @property {num} width
 * @property {num} height
 * @property {array} players
 */


/**
 * @typedef {Object} Player
 * @property {string} name
 * @property {num} x
 * @property {num} y
 * @property {num} health
 * @property {num} actions
 */

app.listen(5000)