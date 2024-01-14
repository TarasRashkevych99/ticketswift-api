require('dotenv').config();
const express = require('express');
const middlewares = require('./middlewares');
const getApisRouter = require('./api/router');
const context = require('./services/context.service');

process.on('SIGINT', () => {
    console.log('Killing the server');
    context.closeConnection();
    console.log('Connection closed');
    server.close();
    process.exit();
});

const app = express();

context.connect();

middlewares(app);

app.get('/', (req, res) => {
    console.log('Cookies: ', req.cookies['ticketswift']);
    console.log('Session: ', req.session);
    console.log('Session ID: ', req.sessionID);
    req.session.views = req.session.views ? req.session.views + 1 : 1;
    console.log('Session views: ', req.session.views);
    res.send('Hello World!');
});

const port = process.env.PORT || 5000;

app.use('/api', getApisRouter());
app.listen(port, () => console.log(`Listening on port ${port}`));
