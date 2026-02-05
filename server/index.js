const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const db = require('./config/db');

// Test database connection
db.getConnection()
  .then((connection) => {
    console.log('MySQL connected successfully');
    connection.release();
  })
  .catch((err) => {
    console.error('MySQL connection error:', err.message);
  });

// Routes
app.use('/api', require('./routes'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
