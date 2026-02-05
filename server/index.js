import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generalLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply general rate limiting to all requests
app.use(generalLimiter);

// Test database connection
import { testConnection } from './config/db.js';

testConnection();

// Routes
import routes from './routes/index.js';
app.use('/api', routes);

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
