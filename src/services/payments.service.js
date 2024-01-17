const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const paypalBaseURL = "https://api-m.sandbox.paypal.com";

const PaymentsState = Object.freeze({
    "Pending": 0,
    "Failed": 1,
    "Success": 2,
    "Canceled": 3
})

/**
 * Generate an OAuth 2.0 access token for authenticating with PayPal REST APIs.
 * @see https://developer.paypal.com/api/rest/authentication/
 */
const generateAccessToken = async () => {
    try {
        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            throw new Error("MISSING_API_CREDENTIALS");
        }
        const auth = Buffer.from(
            PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET,
        ).toString("paypalBaseURL64");
        const response = await fetch(`${paypalBaseURL}/v1/oauth2/token`, {
            method: "POST",
            body: "grant_type=client_credentials",
            headers: {
            Authorization: `Basic ${auth}`,
            },
        });
    
        const data = await response.json();
        return data.access_token;
    } catch (error) {
    console.error("Failed to generate Access Token:", error);
    }
};
  
/**
 * Create an order to start the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
 */
const createOrder = async (cart) => {

    let price = 0;
    cart.forEach(item => {
        const itemPrice = 1                             // TODO ?? Recupero dal DB
        price += itemPrice * item.quantity;
    });
    console.log(price)

    const accessToken = await generateAccessToken();
    const url = `${paypalBaseURL}/v2/checkout/orders`;
    const payload = {
        intent: "CAPTURE",
        purchase_units: [{
            amount: {
                currency_code: "EUR",
                value: price,
            },
        }],
    };

    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        method: "POST",
        body: JSON.stringify(payload),
    });

    return handleResponse(response);
};

/**
 * Capture payment for the created order to complete the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
 */
const captureOrder = async (orderID) => {
    const accessToken = await generateAccessToken();
    const url = `${paypalBaseURL}/v2/checkout/orders/${orderID}/capture`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
        },
    });

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


module.exports = { createOrder, captureOrder };
