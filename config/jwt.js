const { expressjwt: jwt } = require("express-jwt");
const secret = process.env.secret;
const api = process.env.API_URL;

const authJwt = jwt({
  secret,
  algorithms: ["HS256"],
  isRevoked: isRevoked,
}).unless({
  path: [
    { url: `${api}/users/login` },
    { url: `${api}/projects`, methods: ["GET", "OPTIONS"] },
    { url: /^\/api\/v1\/projects\/.*/, methods: ["GET"] },
  ],
});

async function isRevoked(req, token) {
  if (!token.payload.isAdmin) {
    return true;
  }

  return false;
}

module.exports = authJwt;
