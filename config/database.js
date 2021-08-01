const mongoose = require('mongoose');
const User = require('../models/UserModel.js')
const { createUser } = require("../controllers/AuthController.js");

mongoose.Promise = global.Promise;

const dbUri = process.env.DB_URI;
const dbOptions = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
    writeConcern: {
        j: true
    }
}

/**
 * Connects to the mongoose database, and emits ready when connect. Retries if failed
 * @param app
 * @param {number} timeout Timeout in ms
 */
function connectToDB(app, timeout) {
    mongoose.connect(dbUri, dbOptions)
        .then(m => {
            console.log(`[mongodb] Connected to database ${m.connection.name}`);

            // Set admin user
            User.findOne({ email: process.env.ADMIN_EMAIL} )
                .then(player => {
                    if (!player) {
                        createUser(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD, true)
                            .then(() => console.log("Admin created!"))
                    }
                })

            app.emit('ready')
        })
        .catch(err => {
            console.error('[mongodb] ' + err + ', retrying in ' + timeout/1000 + ' seconds')
            setTimeout(() => connectToDB(app, timeout), timeout)
        });
}

/**
 * @param app
 * @return {{dbUri: string, dbOptions: {useUnifiedTopology: boolean, useFindAndModify: boolean, writeConcern: {j: boolean}, useCreateIndex: boolean, useNewUrlParser: boolean}}}
 */
module.exports = function (app) {
    connectToDB(app, 5000)

    return { dbUri, dbOptions }
};