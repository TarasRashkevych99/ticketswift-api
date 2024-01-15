require('dotenv').config();
const express = require('express');
const middlewares = require('./middlewares');
const getApisRouter = require('./api/router');
const context = require('./services/context.service');

const app = express();

middlewares(app);

app.get('/', (req, res) => {
    console.log('Cookies: ', req.cookies['ticketswift']);
    console.log('Session: ', req.session);
    console.log('Session ID: ', req.sessionID);
    req.session.views = req.session.views ? req.session.views + 1 : 1;
    console.log('Session views: ', req.session.views);
    res.send('Hello World!');
});

app.use('/api', getApisRouter());

const port = process.env.PORT || 5000;

const server = app.listen(port, async () => {
    await context.connect();
    console.log(`Listening on port ${port}`);
});

process.on('SIGINT', () => {
    console.log('Killing the server');
    context.closeConnection();
    console.log('Connection closed');
    server.close();
    process.exit();
});
