const paymentService = require('./payments.service');
const context = require('./context.service');
const { ObjectId } = require('mongodb');

async function getCouponByCode(code) {
    return await context.getCollection('coupons').findOne({ code: code });
}

async function getUserValidCouponsById(userId) {
    return await context
        .getCollection('coupons')
        .find({ userId: new ObjectId(userId), valid: true })
        .project({ code: 1 })
        .toArray();
}

async function setCouponAsUsedByCode(code) {
    const filter = { code: code };
    const updateCoupon = {
        $set: {
            valid: false,
        },
    };

    const result = await context
        .getCollection('coupons')
        .updateOne(filter, updateCoupon);

    if (result.modifiedCount <= 0) {
        throw new Error('Could not update coupon');
    }

    return;
}

async function getCouponById(couponId) {
    return await context
        .getCollection('coupons')
        .findOne({ _id: new ObjectId(couponId) });
}

async function addCoupon(couponData) {
    const insertedId = (
        await context.getCollection('coupons').insertOne(couponData)
    ).insertedId;
    //console.log(insertedId);

    const coupon = await getCouponById(new ObjectId(insertedId));

    if (!coupon) {
        throw new Error('Coupon not created');
    }

    return coupon;
}

async function createNewCoupon(userId) {
    // Recupero il numero di acquisti effettuati dall'utente userId, se sono un multiplo di 3, creo un nuovo coupon nel DB

    const counter = await paymentService.countPurchasesByUserId(userId);
    console.log(
        'Complessivamente ' + userId + ' ha effettuato ' + counter + ' acquisti'
    );

    if (counter % 3 === 0) {
        const randomCode = Array.from(Array(12), () =>
            Math.floor(Math.random() * 36).toString(36)
        ).join('');
        const newCoupon = {
            userId: new ObjectId(userId),
            amount: 2.5 + 0.5 * Math.round(Math.random() * 15),
            isPercentage: true,
            valid: true,
            code: randomCode.toUpperCase(),
        };

        return addCoupon(newCoupon);
    }

    return;
}

module.exports = {
    getCouponByCode,
    getUserValidCouponsById,
    setCouponAsUsedByCode,
    createNewCoupon,
};
