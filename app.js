const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require("passport");
require('ejs')

// Only use .env in development mode
if (process.env.NODE_ENV === "development") require('dotenv').config();

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

// Create session with connect mongo
const { mongoosePromise, mongoOptions } = require('./config/database.js')

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        clientPromise: mongoosePromise.then(m => m.connection.getClient()),
        mongoOptions: mongoOptions,
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

// Routes setup
require('./routes')(app)

// Error handling
app.use((err, req, res, next) => {
    res.status(500).send('Something broke!')
})

mongoosePromise.then(() => {
    /* App started here */
    const server = app.listen(process.env.PORT, () => {

        const address = process.env.NODE_ENV === 'development' ? `http://localhost:${ process.env.PORT }` : server.address().address;

        console.log(`[app] Server running on ${ address } in <${ process.env.NODE_ENV }> mode`)
    });
})