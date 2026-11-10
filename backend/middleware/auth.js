const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_personal_tracker_jwt_token_key_2026_xyz');
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found for this token' });
      }
      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no bearer token provided' });
  }
};

module.exports = { protect };

