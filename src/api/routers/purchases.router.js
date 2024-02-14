const express = require('express');
const paymentService = require('../../services/payments.service');
const tokensService = require('../../services/tokens.service');
const ticketService = require('../../services/tickets.service');
const { ObjectId } = require('mongodb');

async function createPayment(req, res) {
    try {
        const body = req.body;

        const token = req.cookies['token'];
        const userInfo = tokensService.verifyToken(token);
        const eventId = body.event_id;

        // TODO Check del coupon

        let price = 1; // TODO Reimpostare a 0
        let items = [];
        const cart = body.cart;
        for (const ticketId in cart) {
            const ticketPrice = await ticketService.getTicketPrice(
                eventId,
                ticketId
            );
            console.log('ticketPrice: ' + ticketPrice);
            price += ticketPrice * cart[ticketId];

            let item = {
                eventId: new ObjectId(eventId),
                ticketId: new ObjectId(ticketId),
                price: ticketPrice,
                quanity: cart[ticketId],
            };
            items.push(item);
        }

        // TODO In caso di coupon, aggiorno price totale

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

async function capturePayment(req, res) {
    const orderID = req.params['orderId'];
    try {
        const { jsonResponse, httpStatusCode } =
            await paymentService.captureOrder(orderID);

        // TODO Gestire caso in cui venga effettuata la chiamata da Postman (https://prnt.sc/UTdsOXRuvSfp)

        // Aggiorno state nel DB
        console.log('Completato, aggiorno DB');
        await paymentService.updatePurchaseState(orderID, 'completed');

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
