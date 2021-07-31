const express = require('express');
const passport = require("passport");
const path = require('path');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
require('ejs')

// Only use .env in development mode
if (process.env.NODE_ENV === "development") require('dotenv').config();

// Init app
const app = express();

// App configs
app.set('view engine', 'ejs')

// Post encoding
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Serve static resources
app.use(express.static(path.join(__dirname, 'public')))
app.use('/css', express.static(path.join(__dirname, 'public/css')))
app.use('/js', express.static(path.join(__dirname, 'public/js')))

// Create session with connect mongo
const { dbUri, dbOptions } = require('./config/database.js')(app)

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new MongoDBStore({
        uri: dbUri,
        collection: 'sessions',
        options: dbOptions
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    httpOnly: true,
    secure: true
}))

// Passport setup
require('./config/passport.js')

app.use(passport.initialize())
app.use(passport.session())

// Routes setup
require('./routes')(app)

// Error handling
app.use((err, req, res, next) => {
    console.log(err)
    next(err);
});

app.use(function(req, res, next){
    res.status(404).send("Whoops, not found!");
});

// Start game

require("./config/game_runner.js")

app.on('ready', () => {
    /* App started here */
    const server = app.listen(process.env.PORT, () => {

        const address = process.env.NODE_ENV === 'development' ? `http://localhost:${ process.env.PORT }` : `port ${ process.env.PORT }`;

        const time = new Date().toLocaleTimeString('en-US', { month: '2-digit', day: '2-digit', hour:'2-digit', minute: '2-digit', second: '2-digit'})

        console.log(`[app] (${ time }) Server running on ${ address } in ${ process.env.NODE_ENV } mode`)
    });
})

