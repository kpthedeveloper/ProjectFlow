import { pool } from '../config/database';
import { PasswordUtils } from '../utils/password';

async function createAdminUser() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Hash the admin password
    const passwordHash = await PasswordUtils.hashPassword('Admin123!');
    
    // Update the admin user with the real password
    const result = await client.query(
      `UPDATE users 
       SET password_hash = $1, is_active = true
       WHERE email = 'admin@company.com'
       RETURNING id, email, name, role`,
      [passwordHash]
    );

    if (result.rows.length > 0) {
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@company.com');
      console.log('🔑 Password: Admin123!');
      console.log('⚠️  Remember to change this password after first login!');
    } else {
      console.log('❌ Admin user not found');
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating admin user:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  createAdminUser();
}

export { createAdminUser };