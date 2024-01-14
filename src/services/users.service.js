const bcrypt = require('bcrypt');
const context = require('./context.service');
const { ObjectId } = require('mongodb');

async function getUserById(userId) {
    return await context
        .getCollection('users')
        .findOne({ _id: new ObjectId(userId) });
}

async function createUser(userInfo) {
    const alreadyInsertedUsername = await context
        .getCollection('users')
        .findOne({ username: userInfo.username });

    if (alreadyInsertedUsername) {
        return null;
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userInfo.password, salt);
    const userId = (
        await context.getCollection('users').insertOne({
            createdOn: new Date(),
            modifedOn: new Date(),
            username: userInfo.username,
            password: hashedPassword,
        })
    ).insertedId;

    const user = await getUserById(userId);

    if (!user) {
        throw new Error('User not created');
    }

    return {
        username: user.username,
        id: user._id.toString(),
    };
}

module.exports = { getUserById, createUser };
