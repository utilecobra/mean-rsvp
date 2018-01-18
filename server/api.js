const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

const Event = require('./models/Event');
const Rsvp = require('./models/Rsvp');

module.exports = function(app, config) {
  const jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${config.AUTH0_DOMAIN}/.well-known/jwks.json`
    }),
    audience: config.AUTH0_API_AUDIENCE,
    issuer: `https://${config.AUTH0_DOMAIN}/`,
    algorithm: 'RS256'
  });

  const adminCheck = (req, res, next) => {
    const roles = req.user[config.NAMESPACE] || [];
    if (roles.indexOf('admin') > -1) {
      next();
    } else {
      res.status(403).send({message: 'Not authorized for admin access'});
    }
  }

  app.get('/api/', (req, res) => {
    res.send('API works');
  });
};
