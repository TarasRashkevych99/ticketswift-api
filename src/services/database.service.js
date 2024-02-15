require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const context = require('./context.service');

const client = new MongoClient(process.env.CONNECTION_STRING);

async function getDbLocations(quary = {}) {
    if (quary._id) {
        quary._id = new ObjectId(quary._id);
    }

    return await context.getCollection('locations').find(quary).toArray();
}

async function getDbEvents(quary = {}) {
    if (quary._id) {
        quary._id = new ObjectId(quary._id);
    }

    return await context.getCollection('events').find(quary).sort({ date: 1 }).toArray();
}

async function getDbArtists(quary = {}) {
    if (quary._id) {
        quary._id = new ObjectId(quary._id);
    }

    return await context.getCollection('artists').find(quary).toArray();
}

module.exports = {
    client,
    ObjectId,
    getDbLocations,
    getDbEvents,
    getDbArtists
};
