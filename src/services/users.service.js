const bcrypt = require('bcrypt');
const context = require('./context.service');
const { ObjectId } = require('mongodb');

async function getUserById(userId) {
    return await context
        .getCollection('users')
        .findOne({ _id: new ObjectId(userId) });
}

async function getUserByEmail(email) {
    return await context.getCollection('users').findOne({ email: email });
}

async function createUser(userInfo) {
    const userWithEmail = await getUserByEmail(userInfo.email);

    if (userWithEmail) {
        return null;
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userInfo.password, salt);
    const userId = (
        await context.getCollection('users').insertOne({
            createdOn: new Date(),
            modifiedOn: new Date(),
            email: userInfo.email,
            password: hashedPassword,
        })
    ).insertedId;

    const user = await getUserById(userId);

    if (!user) {
        throw new Error('User not created');
    }

    return {
        email: user.email,
        id: user._id.toString(),
    };
}

async function getAuthenticatedUser(userToLogin) {
    const user = await getUserByEmail(userToLogin.email);
    if (!user || !(await bcrypt.compare(userToLogin.password, user.password))) {
        return null;
    }
    return { email: user.email, id: user._id.toString() };
}

module.exports = {
    getUserById,
    getUserByEmail,
    createUser,
    getAuthenticatedUser,
};
