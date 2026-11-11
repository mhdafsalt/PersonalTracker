const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, no bearer token provided',
        });
      }

      let decoded;
      try {
        decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'super_secret_personal_tracker_jwt_token_key_2026_xyz'
        );
      } catch (jwtErr) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, token failed or expired',
        });
      }

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user account not found',
        });
      }

      req.user = user;
      return next();
    } catch (dbError) {
      console.error('[Auth Middleware DB Error]:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Internal authentication service error',
      });
    }
  }

  return res.status(401).json({
    success: false,
    message: 'Not authorized, no bearer token provided',
  });
};

module.exports = { protect };
