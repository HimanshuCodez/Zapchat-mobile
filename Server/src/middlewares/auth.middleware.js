import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

// Middleware to authenticate JWT for both web cookies and mobile bearer tokens
export const protectRoute = async (req, res, next) => {
  try {
    const cookieToken = req.cookies?.jwtToken;
    const authHeader = req.headers.authorization;
    const token =
      cookieToken ||
      (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: 'Not authorized, token is invalid' });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log('error in middleware route', error);
    return res.status(401).json({ message: 'Not authorized, token is invalid' });
  }
};