const express = require('express');
const paymentsService = require('../../services/payments.service');
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
                quantity: cart[ticketId],
            };
            items.push(item);
        }

        // In caso di coupon, aggiorno price totale
        if (coupon) {
            if (coupon.isPercentage) {
                price = price - (price * coupon.amount) / 100;
                console.log(price);
            } else {
                price = price - coupon.amount;
            }

            price = price <= 0 ? 0 : price; // Non può essere negativo
        }

        price = price + 1; // Aggiungo 1 euro simbolico di commissioni

        // Aggiungo purchase nel DB
        const purchaseData = {
            userId: userInfo.id,
            items: items,
            price: price,
        };
        const newPurchase = await paymentsService.addPurchase(purchaseData);
        const purchaseId = newPurchase._id;

        const { jsonResponse, httpStatusCode } =
            await paymentsService.createOrder(price);
        //console.log(jsonResponse);
        const payPalId = jsonResponse.id;

        // Aggiorno Paypal Id nel DB
        console.log('Paypal ID: ' + payPalId);
        console.log('Purchase ID: ' + purchaseId);
        await paymentsService.updatePurchasePayPalId(purchaseId, payPalId);

        res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
        console.error('Failed to create order:', error);
        res.status(500).json({ error: 'Failed to create order.' });
    }
}

async function capturePayment(req, res) {
    const paypalId = req.params['orderId'];
    //Zod input validation
    let validation = validationService.idSchema.safeParse(paypalId);
    if (!validation.success) return res.status(400).send(validation.error);

    // Recupero il coupon
    const coupon = req.session.user.coupon;

    try {
        const { jsonResponse, httpStatusCode } =
            await paymentsService.captureOrder(paypalId);

        const userId = res.locals.id;
        const purchase = await paymentsService.getPaypalPurchaseByUserId(
            paypalId,
            userId
        );

        console.log(userId);
        if (!purchase) {
            if (req.session.user.coupon) {
                delete req.session.user.coupon;
            }
            res.status(401).json({
                // eslint-disable-next-line quotes
                error: "Can not update other users' order.",
            });
            return;
        }

        console.log('Status code: ' + httpStatusCode);
        console.log('PaypalId: ' + paypalId);

        if (Number(httpStatusCode) !== 201) {
            console.log('Fallito, aggiorno DB');
            await paymentsService.updatePurchaseState(
                paypalId,
                paymentsService.PaymentState.Failed
            );
            if (req.session.user.coupon) {
                delete req.session.user.coupon;
            }
            res.status(httpStatusCode).json(jsonResponse);
            return;
        }

        console.log('Completato, aggiorno DB');
        await paymentsService.updatePurchaseState(
            paypalId,
            paymentsService.PaymentState.Completed
        );

        // In caso di coupon, lo rendo non più utilizzabile
        if (coupon) {
            console.log(coupon);
            couponService.setCouponAsUsedByCode(coupon.code);
        }

        // Creazione condizionale di un nuovo coupon
        const couponId = await couponService.createNewCoupon(res.locals.id);
        if (couponId) {
            console.log('Creato un nuovo coupon');
            jsonResponse.couponId = couponId;
        }

        if (req.session.user.coupon) {
            delete req.session.user.coupon;
        }
        res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
        console.error('Failed to capture order:', error);
        await paymentsService.updatePurchaseState(
            paypalId,
            paymentsService.PaymentState.Failed
        );
        if (req.session.user.coupon) {
            delete req.session.user.coupon;
        }
        res.status(500).json({ error: 'Failed to capture order.' });
    }
}

async function cancelPayment(req, res) {
    try {
        const userId = res.locals.id;
        const purchase = await paymentsService.getPaypalPurchaseByUserId(
            req.body.id,
            userId
        );

        if (!purchase) {
            if (req.session.user.coupon) {
                delete req.session.user.coupon;
            }
            res.status(401).json({
                // eslint-disable-next-line quotes
                error: "Can not update other users' order.",
            });
            return;
        }

        await paymentsService.updatePurchaseState(
            req.body.id,
            paymentsService.PaymentState.Canceled
        );

        if (req.session.user.coupon) {
            delete req.session.user.coupon;
        }
        res.status(200).json({ msg: 'Purchase updated successfully' });
    } catch (error) {
        if (req.session.user.coupon) {
            delete req.session.user.coupon;
        }
        res.status(400).json({ error: 'Failed to cancel order.' });
    }
}

async function getPaymentByPayPalId(req, res) {
    // Controllo che l'utente che effettua la richiesta sia quello associato al pagamento

    const userId = res.locals.id;
    const paypalId = req.params['orderId'];

    const userPayments = await paymentsService.getPaypalPurchaseByUserId(
        paypalId,
        userId
    );

    if (userPayments) {
        res.status(200).send({ purchaseDetails: userPayments });
    } else {
        res.status(404).send('Purchase not found');
    }
    return;
}

module.exports = function () {
    const router = express.Router();

    router.post('/', createPayment);
    router.post('/:orderId/capture', capturePayment);
    router.post('/cancel', cancelPayment);
    router.get('/:orderId', getPaymentByPayPalId);

    return router;
};
