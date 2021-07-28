const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');


// Extend the default timeout so MongoDB binaries can download
jest.setTimeout(60000);

module.exports = class DBHandler {
    static async init() {
        const mongoMemoryServer = await MongoMemoryServer.create();
        return new DBHandler(mongoMemoryServer);
    }

    constructor(mongoMemoryServer) {
        this.mongoMemoryServer = mongoMemoryServer;
    }

    connect = async () => {
        const uri = this.mongoMemoryServer.getUri();
        const mongooseOpts = {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
            useCreateIndex: true
        };

        await mongoose.connect(uri, mongooseOpts);
    }

    closeDatabase = async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await this.mongoMemoryServer.stop();
    }

    clearDatabase = async () => {
        const collections = mongoose.connection.collections;

        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
    }

    static setup() {
        let dbHandler;

        // Connect to a new in-memory database before running any tests.
        beforeAll(async () => {
            dbHandler = await DBHandler.init()
            await dbHandler.connect()
        });

        // Clear all test data after every test.
        afterEach(async () => await dbHandler.clearDatabase());

        // Remove and close the db and server.
        afterAll(async () => await dbHandler.closeDatabase());
    }
}


