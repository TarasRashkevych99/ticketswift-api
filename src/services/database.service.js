require('dotenv').config();
const { json } = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const client = new MongoClient(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function getDbLocations(quary = {}) {
    await client.connect();
    const database = client.db('Shop');
    const collection = database.collection('locations');
    const result = await collection.find(quary).toArray();

    await client.close();

    return result;
}

async function getDbEvents(quary = {}) {
    await client.connect();
    const database = client.db('Shop');
    const collection = database.collection('events');
    const result = await collection.find(quary).toArray();

    await client.close();

    return result;
}

async function getDbArtists(quary = {}) {
    await client.connect();
    const database = client.db('Shop');
    const collection = database.collection('artists');
    const result = await collection.find(quary).toArray();

    await client.close();

    return result;
}

async function createUser(user) {
    await client.connect();
    const database = client.db('Shop');
    const collection = database.collection('users');
    const result = await collection.insertOne(user);

    await client.close();

    return result;
}

module.exports = {
    client,
    ObjectId,
    getDbLocations,
    getDbEvents,
    getDbArtists,
    createUser,
};
