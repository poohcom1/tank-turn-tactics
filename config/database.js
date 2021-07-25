const mongoose = require('mongoose');

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

// Connect to database
const mongoosePromise = mongoose.connect(dbUri, dbOptions)
    .then(m => {
        console.log(`[mongodb] Connected to database <${process.env.DB_NAME}>`);

        return m; // Return the client to use with connect-mongo
    })
    .catch(err => console.log('[Database error] ' + err));

module.exports = { mongoosePromise, mongoOptions: dbOptions };