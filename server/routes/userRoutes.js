import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  loginUser,
  deleteUser
} from '../controllers/userController.js';

const router = express.Router();

// GET all users
router.get('/', getAllUsers);

// GET user by ID
router.get('/:id', getUserById);

// POST create user
router.post('/', createUser);

// POST login user
router.post('/login', loginUser);

// DELETE user
router.delete('/:id', deleteUser);

export default router;
