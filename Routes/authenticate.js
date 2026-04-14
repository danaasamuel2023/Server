const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { User } = require('../Schema/Schema');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;

function extractToken(req) {
  const header = req.header('Authorization') || req.header('authorization');
  if (header && header.startsWith('Bearer ')) return header.slice(7);
  if (req.query && typeof req.query.token === 'string') return req.query.token;
  return null;
}

const authenticate = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ message: 'No token provided' });
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not configured.');
    return res.status(500).json({ message: 'Server misconfiguration' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id || decoded.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    req.userId = String(user._id);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

const optionalAuthenticate = async (req, res, next) => {
  const token = extractToken(req);
  if (!token || !JWT_SECRET) return next();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id || decoded.userId;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findById(userId).select('-password');
      if (user) {
        req.user = user;
        req.userId = String(user._id);
      }
    }
  } catch (_) {
    // ignore — treat as anonymous
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  next();
};

// requireOwnerOrAdmin(getOwnerIdFromReq) — resolver may return a string, ObjectId, or Promise of either.
const requireOwnerOrAdmin = (getOwnerIdFromReq) => async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    if (req.user.role === 'admin') return next();
    const ownerId = await getOwnerIdFromReq(req);
    if (!ownerId) return res.status(404).json({ message: 'Resource not found' });
    if (String(ownerId) !== String(req.user._id))
      return res.status(403).json({ message: 'Forbidden' });
    next();
  } catch (err) {
    console.error('Ownership check failed:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = authenticate;
module.exports.authenticate = authenticate;
module.exports.optionalAuthenticate = optionalAuthenticate;
module.exports.requireAdmin = requireAdmin;
module.exports.requireOwnerOrAdmin = requireOwnerOrAdmin;
module.exports.JWT_SECRET = JWT_SECRET;
