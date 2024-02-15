require('dotenv').config();
const { ObjectId } = require('mongodb');
const context = require('./context.service');

async function getDbArtists(quary = {}) {
    if (quary._id) {
        quary._id = new ObjectId(quary._id);
    }

    return await context.getCollection('artists').find(quary).toArray();
}

module.exports = {
    getDbArtists
};
