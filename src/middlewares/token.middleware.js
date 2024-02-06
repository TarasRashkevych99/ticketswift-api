const tokensService = require('../services/tokens.service');
const usersService = require('../services/users.service');

function token(req, res, next) {
    if (req.method === 'OPTIONS') {
        next();
        return;
    }

    const token = req.cookies['token'];

    if (!token) {
        res.status(401).send({ error: 'No token provided' });
        return;
    }

    const userInfo = tokensService.verifyToken(token);

    if (!userInfo) {
        res.status(401).send({ error: 'Invalid token' });
        return;
    }

    const userId = userInfo.id;
    const user = usersService.getUserById(userId);

    if (!user) {
        res.status(401).send({ error: 'Invalid token' });
        return;
    }

    if (!req.session.user) {
        res.status(401).send({ error: 'No active session' });
        return;
    }

    if (req.session.user.id !== userInfo.id) {
        res.status(401).send({ error: 'Invalid token' });
        return;
    }

    res.locals = userInfo;
    console.log(res.locals);
    next();
}

module.exports = token;
