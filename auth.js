const { User } = require('./models.js');

const jwtSecret = 'your_jwt_secret', //same key used in JWTStrategy in passport.js
    jwt = require('jsonwebtoken'),
    passport = require('passport');

require('./passport.js');

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.username,
        expiresIn: '7d',
        algorithm: 'HS256'
    });
}

//post login
module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', { session: false }, (error, user, info) => {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user: User
                });
            }
            req.login(user, { session: false }, (error) => {
                if (error) {
                    res.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({ user, token });
            });
        })(req, res);
    });
}