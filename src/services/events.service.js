require('dotenv').config();
const { ObjectId } = require('mongodb');
const context = require('./context.service');

async function getDbEvents(quary = {}) {
    if (quary._id) {
        quary._id = new ObjectId(quary._id);
    }

    return await context.getCollection('events').find(quary).sort({ date: 1 }).toArray();
}

module.exports = {
    getDbEvents,
};
