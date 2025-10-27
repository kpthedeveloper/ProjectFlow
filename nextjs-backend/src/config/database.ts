import { Pool } from 'pg';

export const pool = new Pool({
  user: 'admin',
  host: 'localhost',  // Use the container IP we just found
  database: 'project_management',
  password: 'password123',
  port: 5433,
});

export const testConnection = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully');
    client.release();
  } catch (error: any) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    throw error;
  }
};