import express from 'express';
import { 
  submitClickTest, 
  getLeaderboard, 
  getUserStats, 
  getTestHistory 
} from '../controllers/gameController.js';
import { verifyToken } from '../middleware/auth.js';
import { gameSubmitLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// GET leaderboard (public)
router.get('/leaderboard', getLeaderboard);

// POST submit click test (protected + rate limited)
router.post('/submit', verifyToken, gameSubmitLimiter, submitClickTest);

// GET user stats (protected)
router.get('/stats', verifyToken, getUserStats);

// GET user test history (protected)
router.get('/history', verifyToken, getTestHistory);

export default router;
