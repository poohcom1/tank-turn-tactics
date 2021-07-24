require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose')

// Models
const User = require('./models/user_model.js')
const Game = require('./models/game_model.js')

const app = express();

// Configs
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))

// Serve static
app.use(express.static(path.join(__dirname, 'public')))
app.use('/css', express.static(path.join(__dirname, 'public/css')))
app.use('/js', express.static(path.join(__dirname, 'public/js')))


/* --------------------------------- Database ------------------------------- */
const dbUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to database');
        app.emit("ready")
    })
    .catch(err => console.log('[Database error] ' + err));

function addUser(username, uid) {
    const user = new User({
        username: username,
        uid: uid
    })

    return user.save();
}

function addGame(name, size, actionsPerDay, actionsPerInterval, tieCount,
    allowVoteChange,
    doActionQueue,
    doBroadcastAction,
    doFogOfWar,
    doBounty,
    doEscort) {
    const game = new Game({
        name: name,
        size: size,
        actionsPerDay: actionsPerDay,
        actionsPerInterval: actionsPerInterval,
        tieCount: tieCount,
        allowVoteChange: allowVoteChange,
        doActionQueue: doActionQueue,
        doBroadcastAction: doBroadcastAction,
        doFogOfWar: doFogOfWar,
        doBounty: doBounty,
        doEscort: doEscort
    })

    return game.save();
}


// Routes

app.get('/', (req, res) => {
    res.render('index')
})

// body: email, username, password
app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/register', (req, res) => {

})

app.get('/register', (req, res) => {
    res.render('register')
})


app.post('/register', (req, res) => {

})

app.on("ready", () => {
    /* App started here */
    app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
})