const bcrypt = require('bcrypt');
const context = require('./context.service');
const { ObjectId } = require('mongodb');

async function getCouponbyCode(code) {
    return await context.getCollection('coupons').findOne({ code: code });
}

async function getUserValidCouponsById(userId) {
    return await context
        .getCollection('coupons')
        .find({ userId: new ObjectId(userId), valid: true })
        .project({ code: 1 })
        .toArray();
}

module.exports = {
    getCouponbyCode,
    getUserValidCouponsById,
};
