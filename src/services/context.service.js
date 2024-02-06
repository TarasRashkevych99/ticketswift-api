const { MongoClient } = require('mongodb');

let connection = null;

async function connect() {
    connection = await new MongoClient(process.env.CONNECTION_STRING).connect();
    console.log('Connected to the database');

    return connection;
}

function getConnection() {
    if (connection === null) {
        throw new Error('Connection not found');
    }
    return connection;
}

function closeConnection() {
    connection?.close();
    connection = null;
    console.log('\nDisconected from the database');
}

function getCollection(collection) {
    return getDatabase().collection(collection);
}

function getDatabase(db = process.env.DEFAULT_DB) {
    if (connection === null) {
        throw new Error('Connection not found');
    }
    return connection?.db(db);
}

module.exports = {
    connect: connect,
    getConnection: getConnection,
    closeConnection: closeConnection,
    getDatabase: getDatabase,
    getCollection: getCollection,
};
