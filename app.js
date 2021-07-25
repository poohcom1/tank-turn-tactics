const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require("passport");
require('ejs')

const routes = require('./routes')


if (process.env.NODE_ENV === "development") require('dotenv').config(); // Only use .env in development mode

// Init app
const app = express();

// App configs
app.set('view engine', 'ejs')

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static resources
app.use(express.static(path.join(__dirname, 'public')))
app.use('/css', express.static(path.join(__dirname, 'public/css')))
app.use('/js', express.static(path.join(__dirname, 'public/js')))

/* --------------------------------- Database ------------------------------- */
const dbUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const dbOptions = { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }

// Connect to database
const clientPromise = mongoose.connect(dbUri, dbOptions)
    .then(m => {
        console.log(`[mongodb] Connected to database <${process.env.DB_NAME}>`);
        app.emit("ready");

        return m.connection.getClient(); // Return the client to use with connect-mongo
    })
    .catch(err => console.log('[Database error] ' + err));

// Create session with connect mongo
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        clientPromise: clientPromise,
        dbName: process.env.DB_NAME,
        collectionName: 'sessions',
        autoRemove: 'interval',
        autoRemoveInterval: 1
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}))

// Passport setup
require('./config/passport.js')

app.use(passport.initialize())
app.use(passport.session())


// Routes
app.use(routes)

app.on("ready", () => {
    /* App started here */
    app.listen(process.env.PORT, () => console.log(`[app] Server running on port ${process.env.PORT} in <${process.env.NODE_ENV}> mode`));
})