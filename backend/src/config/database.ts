/**
 * Database Configuration
 * PostgreSQL connection pool setup and utilities
 */

import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL pool configuration
const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ours_app',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

// Create PostgreSQL connection pool
export const pool = new Pool(poolConfig);

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✓ Database connection established successfully');
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    return false;
  }
};

// Query helper with error handling
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query:', { text, duration, rows: result.rowCount });
    }

    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Transaction helper
export const transaction = async (callback: (client: any) => Promise<any>) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Graceful shutdown
export const closePool = async () => {
  await pool.end();
  console.log('Database pool closed');
};

// Handle process termination
process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});
