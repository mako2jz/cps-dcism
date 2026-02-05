import db from '../config/db.js';
import bcrypt from 'bcrypt';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    // SECURITY: Explicitly select columns to avoid leaking password_hash or other sensitive data
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
    let { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Sanitize input
    username = username.trim();
    
    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }

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
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Find user by username
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];

    // 2. Compare password with hash
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Return user info (excluding password)
    const { password_hash, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
    
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