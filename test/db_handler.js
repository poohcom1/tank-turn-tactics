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
            useUnifiedTopology: true,
            poolSize: 10
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
            await collection.deleteMany();
        }
    }
}


