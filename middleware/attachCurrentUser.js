// middleware/attachCurrentUser.js
const User = require('../models/User');

const attachCurrentUser = async (req, res, next) => {
  try {
    if (req.user && req.user.id) {
      const currentUser = await User.findById(req.user.id);
      res.locals.currentUser = currentUser;
    }
  } catch (err) {
    console.error('Error attaching user:', err);
  }
  
  next();
};

module.exports = attachCurrentUser;
