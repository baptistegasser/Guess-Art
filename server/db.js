const mongoose = require('mongoose');

const MONGODB_ADDRESS = process.env.MONGODB_ADDRESS;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE;
const MONGODB_USER = process.env.MONGODB_USER;
const MONGODB_PASS = process.env.MONGODB_PASS;

const MONGO_URL = `mongodb://${MONGODB_USER}:${MONGODB_PASS}@${MONGODB_ADDRESS}:27017/${MONGODB_DATABASE}`;

const ConnectToMongoDB = async () => {
    try {
        await mongoose.connect(MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports = ConnectToMongoDB;