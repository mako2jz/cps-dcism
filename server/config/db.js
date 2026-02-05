import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cps_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Get promise-based connection
const promisePool = pool.promise();

// Test database connection
export const testConnection = async () => {
  try {
    const [rows] = await promisePool.query('SELECT DATABASE() AS db');
    const currentDb = rows[0]?.db || null;
    const expectedDb = process.env.DB_NAME || 'cps_db';

    if (!currentDb) {
      console.error(`Connected to MySQL server but no default database selected (expected "${expectedDb}").`);
      return;
    }

    if (currentDb !== expectedDb) {
      console.error(`Connected to MySQL server but default database is "${currentDb}", expected "${expectedDb}".`);
      return;
    }

    console.log('MySQL Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
};

export default promisePool;