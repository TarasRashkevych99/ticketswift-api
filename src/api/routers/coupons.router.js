const express = require('express');
const couponsService = require('../../services/coupons.service');
const validationService = require('../../services/validation.service');
const { ObjectId } = require('mongodb');

async function applyCoupon(req, res) {
    if (req.session.user.coupon) {
        return res.status(400).send('Cannot apply more than one coupon');
    }

    const userCoupon = req.body;

    //Zod input validation
    let validation = validationService.couponSchema.safeParse(userCoupon);

    if (!validation.success) {
        return res.status(400).send(validation.error);
    }

    const coupon = await couponsService.getCouponByCode(userCoupon.code);

    if (!coupon) {
        return res.status(400).send('Invalid coupon code');
    }

    const userId = res.locals.id;

    const userCoupons = await couponsService.getUserValidCouponsById(userId);

    const availableCodes = userCoupons.map((coupon) => coupon.code);

    console.log(availableCodes);
    if (!availableCodes.includes(userCoupon.code)) {
        return res
            .status(400)
            .send('Coupon already used or not valid for this account');
    }

    req.session.user.coupon = {
        code: coupon.code,
        amount: coupon.amount,
        isPercentage: coupon.isPercentage,
    };

    res.status(200).send({ isCouponApplied: true });
}

async function getCouponById(req, res) {
    const userId = res.locals.id;
    const couponId = req.params['couponId'];

    const userCoupon = await couponsService.getValidCouponByIds(
        couponId,
        userId
    );

    if (userCoupon) {
        res.status(200).send({ couponDetails: userCoupon });
    } else {
        res.status(404).send('Coupon not found');
    }
    return;
}

module.exports = function () {
    const router = express.Router();

    router.post('/apply', applyCoupon);
    router.get('/:couponId', getCouponById);

    return router;
};
