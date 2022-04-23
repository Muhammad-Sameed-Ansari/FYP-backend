const expressJwt = require('express-jwt');

function authJwt() {
    const secret = process.env.secret;
    const api_url = process.env.API_URL;

    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            {url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS', 'PUT', 'POST']},
            {url: /\/api\/v1\/orders(.*)/, methods: ['GET', 'OPTIONS', 'POST']},
            {url: /(.*)/, methods: ['GET', 'OPTIONS', 'POST']},
            `${api_url}/users/login`,
            `${api_url}/users/register`
        ]
    })
}

async function isRevoked(req, payload, done) {
    if(!payload.isAdmin) {
        done(null, true);
    }
    done();  
}

module.exports = authJwt;