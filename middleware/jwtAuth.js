// middleware/jwtAuth.js
const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req, res, next) => {
  
  const token = req.cookies?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      console.log('Invalid token:', err);
    }
  }
  next();
};

module.exports = jwtAuthMiddleware;
