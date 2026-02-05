import db from '../config/db.js';
import bcrypt from 'bcrypt';

// Helper to remove sensitive data
const sanitizeUser = (user) => {
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    // explicitly select columns to avoid accidentally leaking future sensitive fields
    const [rows] = await db.query('SELECT id, username, created_at, is_banned FROM users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, username, created_at, is_banned FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create user
export const createUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Hash Password (Salt rounds: 10)
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    const [result] = await db.query(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, hash]
    );

    // Return ID but NEVER the password
    res.status(201).json({ id: result.insertId, username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user (Self-Service)
export const updateUser = async (req, res) => {
  try {
    const username = req.body;
    
    // Note: In a real app, you should check if req.user.id matches req.params.id here so users can't update others
    const [result] = await db.query(
      'UPDATE users SET username = ? WHERE id = ?',
      [username, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: req.params.id, username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user (Admin or Self)
export const deleteUser = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};