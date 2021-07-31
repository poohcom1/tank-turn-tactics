const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const dbUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;
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
            console.log(`[mongodb] Connected to database ${process.env.DB_NAME}`);

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