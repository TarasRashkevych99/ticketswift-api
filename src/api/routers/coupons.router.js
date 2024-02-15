const express = require('express');
const usersService = require('../../services/users.service');
const tokenService = require('../../services/tokens.service');
const couponsService = require('../../services/coupons.service');

async function applyCoupon(req, res) {
    if (req.session.user.coupon) {
        return res.status(400).send('Cannot apply more than one coupon');
    }

    const userCoupon = req.body;

    const coupon = await couponsService.getCouponByCode(userCoupon.code);

    if (!coupon) {
        return res.status(400).send('Invalid coupon code');
    }

    const userId = res.locals.id;

    const userCoupons = await couponsService.getUserValidCouponsById(userId);

    const availableCodes = userCoupons.map((coupon) => coupon.code);

    console.log(availableCodes);
    if (!availableCodes.includes(userCoupon.code)) {
        return res.status(400).send('Coupon already used or not valid for this account');
    }

    req.session.user.coupon = {
        code: coupon.code,
        amount: coupon.amount,
        percent: coupon.percent
    };


    res.status(200).send({ isCouponApplied: true });
}

module.exports = function () {
    const router = express.Router();

    router.post('/apply', applyCoupon);

    return router;
};
