import express from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// POST register - with rate limiting
router.post('/register', authLimiter, register);

// POST login - with rate limiting
router.post('/login', authLimiter, login);

// GET current user profile (protected)
router.get('/me', verifyToken, getProfile);

export default router;
