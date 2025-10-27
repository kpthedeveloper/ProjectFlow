import { pool } from '../config/database';
import { User } from '../types';

export class UserRepository {
  async findAll(): Promise<User[]> {
    const result = await pool.query(`
      SELECT id, email, name, role, avatar, is_active, department, position, 
             last_login, created_at, password_hash, refresh_token, 
             refresh_token_expires_at, password_reset_token, password_reset_expires,
             login_attempts, lock_until, requires_password_change
      FROM users
      ORDER BY created_at DESC
    `);
    return result.rows.map(this.mapRowToUser);
  }

  async findById(id: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT id, email, name, role, avatar, is_active, department, position, 
              last_login, created_at, password_hash, refresh_token, 
              refresh_token_expires_at, password_reset_token, password_reset_expires,
              login_attempts, lock_until, requires_password_change
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows.length ? this.mapRowToUser(result.rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT id, email, name, role, avatar, is_active, department, position, 
              last_login, created_at, password_hash, refresh_token, 
              refresh_token_expires_at, password_reset_token, password_reset_expires,
              login_attempts, lock_until, requires_password_change
       FROM users WHERE email = $1`,
      [email]
    );
    return result.rows.length ? this.mapRowToUser(result.rows[0]) : null;
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (email, name, role, avatar, is_active, department, position, password_hash, requires_password_change)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, email, name, role, avatar, is_active, department, position, 
                 last_login, created_at, password_hash, refresh_token, 
                 refresh_token_expires_at, password_reset_token, password_reset_expires,
                 login_attempts, lock_until, requires_password_change`,
      [
        userData.email,
        userData.name,
        userData.role,
        userData.avatar,
        userData.isActive,
        userData.department,
        userData.position,
        userData.passwordHash,
        true // SET requires_password_change to true for new users
      ]
    );
    return this.mapRowToUser(result.rows[0]);
  }

  async update(id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic update query
    for (const [key, value] of Object.entries(userData)) {
      if (value !== undefined) {
        fields.push(`${this.camelToSnake(key)} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, name, role, avatar, is_active, department, position, 
                last_login, created_at, password_hash, refresh_token, 
                refresh_token_expires_at, password_reset_token, password_reset_expires,
                login_attempts, lock_until, requires_password_change
    `;

    const result = await pool.query(query, values);
    return result.rows.length ? this.mapRowToUser(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Authentication-specific methods
  async updateRefreshToken(id: string, refreshToken: string | null, expiresAt: Date | null): Promise<void> {
    await pool.query(
      'UPDATE users SET refresh_token = $1, refresh_token_expires_at = $2 WHERE id = $3',
      [refreshToken, expiresAt, id]
    );
  }

  async updateLoginAttempts(id: string, attempts: number, lockUntil: Date | null): Promise<void> {
    await pool.query(
      'UPDATE users SET login_attempts = $1, lock_until = $2 WHERE id = $3',
      [attempts, lockUntil, id]
    );
  }

  async updateLastLogin(id: string): Promise<void> {
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  }

  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT id, email, name, role, avatar, is_active, department, position, 
              last_login, created_at, password_hash, refresh_token, 
              refresh_token_expires_at, password_reset_token, password_reset_expires,
              login_attempts, lock_until, requires_password_change
       FROM users WHERE refresh_token = $1 AND refresh_token_expires_at > CURRENT_TIMESTAMP`,
      [refreshToken]
    );
    return result.rows.length ? this.mapRowToUser(result.rows[0]) : null;
  }

  async findByPasswordResetToken(resetToken: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT id, email, name, role, avatar, is_active, department, position, 
              last_login, created_at, password_hash, refresh_token, 
              refresh_token_expires_at, password_reset_token, password_reset_expires,
              login_attempts, lock_until, requires_password_change
       FROM users WHERE password_reset_token = $1 AND password_reset_expires > CURRENT_TIMESTAMP`,
      [resetToken]
    );
    return result.rows.length ? this.mapRowToUser(result.rows[0]) : null;
  }

  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      avatar: row.avatar,
      isActive: row.is_active,
      department: row.department,
      position: row.position,
      lastLogin: row.last_login,
      createdAt: row.created_at,
      passwordHash: row.password_hash,
      refreshToken: row.refresh_token,
      refreshTokenExpiresAt: row.refresh_token_expires_at,
      resetToken: row.password_reset_token, // Fixed: should be password_reset_token
      resetTokenExpires: row.password_reset_expires, // Fixed: should be password_reset_expires
      loginAttempts: row.login_attempts,
      lockUntil: row.lock_until,
      requiresPasswordChange: row.requires_password_change
    };
  }

  async findByRole(role: string): Promise<User[]> {
    const result = await pool.query(
      `SELECT id, email, name, role, avatar, is_active, department, position, 
              last_login, created_at, password_hash, refresh_token, 
              refresh_token_expires_at, password_reset_token, password_reset_expires,
              login_attempts, lock_until, requires_password_change
       FROM users WHERE role = $1 AND is_active = true
       ORDER BY created_at DESC`,
      [role]
    );
    return result.rows.map(this.mapRowToUser);
  }

  async setPasswordResetToken(id: string, resetToken: string | null, expiresAt: Date | null): Promise<void> {
    await pool.query(
      'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
      [resetToken, expiresAt, id]
    );
  }
  
  async findByResetToken(resetToken: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT id, email, name, role, avatar, is_active, department, position, 
              last_login, created_at, password_hash, refresh_token, 
              refresh_token_expires_at, password_reset_token, password_reset_expires,
              login_attempts, lock_until, requires_password_change
       FROM users WHERE password_reset_token = $1 AND password_reset_expires > CURRENT_TIMESTAMP`,
      [resetToken]
    );
    return result.rows.length ? this.mapRowToUser(result.rows[0]) : null;
  }
  
  async setRequiresPasswordChange(id: string, requiresChange: boolean): Promise<void> {
    await pool.query(
      'UPDATE users SET requires_password_change = $1 WHERE id = $2',
      [requiresChange, id]
    );
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}