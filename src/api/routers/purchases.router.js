const express = require('express');
const {
    createOrder,
    captureOrder,
} = require('../../services/payments.service');

async function createPayment(req, res) {
    try {
        const { cart } = req.body;
        const { jsonResponse, httpStatusCode } = await createOrder(cart);
        res.status(httpStatusCode).json(jsonResponse);

        // TODO ?? Aggiungo purchase nel DB
    } catch (error) {
        console.error('Failed to create order:', error);
        res.status(500).json({ error: 'Failed to create order.' });
    }
}

async function capturePayment(req, res) {
    try {
        const { orderID } = req.params;
        const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
        res.status(httpStatusCode).json(jsonResponse);

        // TODO ?? Aggiorno state del purchase nel DB
    } catch (error) {
        console.error('Failed to create order:', error);
        res.status(500).json({ error: 'Failed to capture order.' });
    }
}

module.exports = function () {
    const router = express.Router();

    router.post('/', createPayment);
    router.post('/:orderId/capture', capturePayment);

    return router;
};
