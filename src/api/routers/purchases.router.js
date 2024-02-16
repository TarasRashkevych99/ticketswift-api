const express = require('express');
const paymentService = require('../../services/payments.service');
const tokensService = require('../../services/tokens.service');
const ticketService = require('../../services/tickets.service');
const couponService = require('../../services/coupons.service');
const validationService = require('../../services/validation.service');
const { ObjectId } = require('mongodb');

async function createPayment(req, res) {
    try {
        const body = req.body;
        //Zod input validation
        let validation = validationService.purchaseSchema.safeParse(body);
        if (!validation.success) return res.status(400).send(validation.error);
        const userInfo = res.locals;

        const objectIdPattern = /^[0-9a-fA-F]{24}$/;
        let eventId = body.event_id;

        if (objectIdPattern.test(eventId)) {
            // Controllo che l'eventId sia del formato ObjectId --> Nostro evento
            eventId = new ObjectId(eventId);
        }

        // Recupero il coupon
        const coupon = req.session.user.coupon;

        let price = 0;
        let items = [];
        const cart = body.cart;
        for (let ticketId in cart) {
            if (objectIdPattern.test(ticketId)) {
                // Controllo che il ticketId sia del formato ObjectId --> Nostro evento
                ticketId = new ObjectId(ticketId);
            }

            const ticketPrice = await ticketService.getTicketPrice(
                eventId,
                ticketId
            );
            price += ticketPrice * cart[ticketId];

            let item = {
                eventId: eventId,
                ticketId: ticketId,
                price: ticketPrice,
                quanity: cart[ticketId],
            };
            items.push(item);
        }

        // In caso di coupon, aggiorno price totale
        if (coupon) {
            console.log(coupon);
            if (coupon.percent) {
                price = price - (price * coupon.amount) / 100;
            } else {
                price = price - coupon.amount;
            }

            price = price <= 0 ? 0 : price; // Non può essere negativo
        }

        price = price + 1; // Aggiungo 1 euro simbolico di commissioni

        // Aggiungo purchase nel DB
        purchaseData = {
            userId: userInfo.id,
            items: items,
            price: price,
        };
        const newPurchase = await paymentService.addPurchase(purchaseData);
        const purchaseId = newPurchase._id;

        const { jsonResponse, httpStatusCode } =
            await paymentService.createOrder(price);
        //console.log(jsonResponse);
        const payPalId = jsonResponse.id;

        // Aggiorno Paypal Id nel DB
        console.log('Paypal ID: ' + payPalId);
        console.log('Purchase ID: ' + purchaseId);
        await paymentService.updatePurchasePayPalId(purchaseId, payPalId);

        res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
        console.error('Failed to create order:', error);
        res.status(500).json({ error: 'Failed to create order.' });
    }
}

// TODO Controllare l'aggiornamento degli stati failed e canceled
async function capturePayment(req, res) {
    const orderID = req.params['orderId'];
    //Zod input validation
    let validation = validationService.idSchema.safeParse(orderID);
    if (!validation.success) return res.status(400).send(validation.error);

    // Recupero il coupon
    const coupon = req.session.user.coupon;

    try {
        const { jsonResponse, httpStatusCode } =
            await paymentService.captureOrder(orderID);

        console.log(httpStatusCode);
        if (!(httpStatusCode !== 200 || httpStatusCode !== 201)) {
            console.log('Fallito, aggiorno DB');
            await paymentService.updatePurchaseState(orderID, 'failed');
            res.status(httpStatusCode).json(jsonResponse);
            return;
        }

        console.log('Completato, aggiorno DB');
        await paymentService.updatePurchaseState(orderID, 'completed');

        // In caso di coupon, lo rendo non più utilizzabile
        if (coupon) {
            console.log(coupon);
            couponService.setCouponAsUsedByCode(coupon.code);
        }

        // Creazione condizionale di un nuovo coupon
        const newCoupon = await couponService.createNewCoupon(res.locals.id);
        if (newCoupon) {
            console.log('Creato un nuovo coupon');
            jsonResponse.newCoupon = newCoupon;
        }

        res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
        console.error('Failed to capture order:', error);
        await paymentService.updatePurchaseState(orderID, 'canceled');
        res.status(500).json({ error: 'Failed to capture order.' });
    }
}

module.exports = function () {
    const router = express.Router();

    router.post('/', createPayment);
    router.post('/:orderId/capture', capturePayment);

    return router;
};
