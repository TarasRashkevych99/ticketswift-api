const { ObjectId } = require('mongodb');
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const paypalBaseURL = 'https://api-m.sandbox.paypal.com';

const context = require('./context.service');

const PaymentState = Object.freeze({
    Pending: 0,
    Failed: 1,
    Completed: 2,
    Canceled: 3,
});

async function addPurchase(purchaseData) {
    const newPurchase = {
        payPalId: null,
        userId: new ObjectId(purchaseData.userId),
        items: purchaseData.items,
        price: purchaseData.price,
        state: PaymentState.Pending,
        createdOn: new Date(),
        modifiedOn: new Date(),
    };

    //console.log(newPurchase);

    const insertedId = (
        await context.getCollection('purchases').insertOne(newPurchase)
    ).insertedId;
    //console.log(insertedId);

    const purchase = await getPurchaseById(new ObjectId(insertedId));
    //console.log(purchase);

    if (!purchase) {
        throw new Error('Purchase not created');
    }

    return purchase;
}

async function getPurchaseById(purchaseId) {
    return await context
        .getCollection('purchases')
        .findOne({ _id: new ObjectId(purchaseId) });
}

async function countPurchasesByUserId(userId) {
    return await context
        .getCollection('purchases')
        .countDocuments({
            userId: new ObjectId(userId),
            state: PaymentState.Completed,
        });
}

async function getPaypalPurchaseByUserId(payPalId, userId) {
    return await context
        .getCollection('purchases')
        .findOne({ payPalId: payPalId, userId: new ObjectId(userId) });
}

async function updatePurchaseState(payPalId, newState) {
    const filter = { payPalId: String(payPalId), state: PaymentState.Pending };
    const updatePurchase = {
        $set: {
            state: newState,
            modifiedOn: new Date(),
        },
    };

    const result = await context
        .getCollection('purchases')
        .updateOne(filter, updatePurchase);

    if (result.modifiedCount !== 1) {
        throw new Error('Could not update Purchase state');
    }
}

async function updatePurchasePayPalId(purchaseId, payPalId) {
    const filter = { _id: new ObjectId(purchaseId) };
    const updatePurchase = {
        $set: {
            payPalId: payPalId,
            modifiedOn: new Date(),
        },
    };

    const result = await context
        .getCollection('purchases')
        .updateOne(filter, updatePurchase);

    if (result.modifiedCount !== 1) {
        throw new Error('Could not update Purchase');
    }
}

/**
 * Generate an OAuth 2.0 access token for authenticating with PayPal REST APIs.
 * @see https://developer.paypal.com/api/rest/authentication/
 */
const generateAccessToken = async () => {
    console.log('Generating Access Token');
    try {
        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            throw new Error('MISSING_API_CREDENTIALS');
        }
        const auth = Buffer.from(
            PAYPAL_CLIENT_ID + ':' + PAYPAL_CLIENT_SECRET
        ).toString('base64');
        const response = await fetch(`${paypalBaseURL}/v1/oauth2/token`, {
            method: 'POST',
            body: 'grant_type=client_credentials',
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });

        const data = await response.json();
        //console.log(data.access_token);
        return data.access_token;
    } catch (error) {
        console.error('Failed to generate Access Token:', error);
    }
};

/**
 * Create an order to start the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
 */
const createOrder = async (price) => {
    console.log('createOrder');

    const accessToken = await generateAccessToken();
    const url = `${paypalBaseURL}/v2/checkout/orders`;
    const payload = {
        intent: 'CAPTURE',
        purchase_units: [
            {
                amount: {
                    currency_code: 'EUR',
                    value: price,
                },
            },
        ],
    };

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'POST',
        body: JSON.stringify(payload),
    });

    return handleResponse(response);
};

/**
 * Capture payment for the created order to complete the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
 */
const captureOrder = async (orderID) => {
    console.log('Capturing order');

    const accessToken = await generateAccessToken();
    const url = `${paypalBaseURL}/v2/checkout/orders/${orderID}/capture`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });

    console.log(
        'Response ricevuta da ' +
            `${paypalBaseURL}/v2/checkout/orders/${orderID}/capture` +
            ', chiamo handleResponse'
    );

    return handleResponse(response);
};

async function handleResponse(response) {
    try {
        const jsonResponse = await response.json();
        return {
            jsonResponse,
            httpStatusCode: response.status,
        };
    } catch (err) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }
}

module.exports = {
    createOrder,
    captureOrder,
    addPurchase,
    updatePurchaseState,
    updatePurchasePayPalId,
    countPurchasesByUserId,
    getPaypalPurchaseByUserId,
    PaymentState,
};
