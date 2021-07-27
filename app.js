const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
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
const { dbUri, dbOptions } = require('./config/database.js')(app)

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new MongoDBStore({
        uri: dbUri,
        collection: 'sessions'
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
// app.use((req, res, next) => {
//     const error = new Error("Not found");
//     error.status = 404;
//     next(error);
// });
//
// // error handler middleware
// app.use((error, req, res, next) => {
//     res.status(error.status || 500).send({
//         error: {
//             status: error.status || 500,
//             message: error.message || 'Internal Server Error',
//         },
//     });
// });


app.on('ready', () => {
    /* App started here */
    const server = app.listen(process.env.PORT, () => {

        const address = process.env.NODE_ENV === 'development' ? `http://localhost:${ process.env.PORT }` : server.address().address;

        console.log(`\x1b[36m[app] Server running on ${ address } in \x1b[1m${ process.env.NODE_ENV }\x1b[0m \x1b[36mmode\x1b[0m`)
    });
})