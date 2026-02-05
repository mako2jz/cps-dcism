import express from 'express';
import userRoutes from './userRoutes.js';
import authRoutes from './authRoutes.js';
import gameRoutes from './gameRoutes.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/game', gameRoutes);

export default router;
