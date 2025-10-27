import { pool } from '../config/database';
import { PasswordUtils } from '../utils/password';

async function setAllPasswords() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Hash passwords for all users
    const passwordHash = await PasswordUtils.hashPassword('Password123!');
    
    // Update all users with the same password for demo
    const result = await client.query(
      `UPDATE users 
       SET password_hash = $1, is_active = true
       RETURNING id, email, name, role`,
      [passwordHash]
    );

    console.log('✅ All user passwords updated successfully!');
    console.log('📧 All users now have password: Password123!');
    console.log('Updated users:');
    
    result.rows.forEach(user => {
      console.log(`- ${user.email} (${user.role})`);
    });

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error setting passwords:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  setAllPasswords();
}

export { setAllPasswords };