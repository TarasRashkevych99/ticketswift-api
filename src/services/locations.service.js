require('dotenv').config();
const { ObjectId } = require('mongodb');
const context = require('./context.service');

async function getDbLocations(quary = {}) {
    if (quary._id) {
        quary._id = new ObjectId(quary._id);
    }

    return await context.getCollection('locations').find(quary).toArray();
}

module.exports = {
    getDbLocations
};
