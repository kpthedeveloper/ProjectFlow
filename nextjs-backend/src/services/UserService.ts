import { UserRepository } from '../repositories/UserRepository';
import { PasswordUtils } from '../utils/password';
import { JWTUtils } from '../utils/jwt';
import { User, ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest } from '../types';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin' | 'passwordHash'>): Promise<User> {
    // Validate required fields
    if (!userData.email || !userData.name) {
      throw new Error('Email and name are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Invalid email format');
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Validate role
    const validRoles: User['role'][] = ['admin', 'manager', 'user'];
    if (!validRoles.includes(userData.role)) {
      throw new Error('Invalid role');
    }

    // Set default password and require change on first login
    const defaultPassword = 'Password123!';
    const hashedPassword = await PasswordUtils.hashPassword(defaultPassword);

    // Create user with default password and password change requirement
    const userWithPassword = {
      ...userData,
      passwordHash: hashedPassword,
      requiresPasswordChange: true
    };

    const createdUser = await this.userRepository.create(userWithPassword);

    // Log the default password (in production, this would be sent via email)
    console.log(`✅ User ${userData.email} created with default password: ${defaultPassword}`);
    console.log('⚠️  User must change password on first login');

    return createdUser;
  }

  async updateUser(id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    const existing = await this.userRepository.findById(id);
    if (!existing) {
      throw new Error('User not found');
    }

    // If updating email, check for duplicates
    if (userData.email && userData.email !== existing.email) {
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
    }

    // If password is being updated, hash it
    if (userData.passwordHash) {
      const passwordValidation = PasswordUtils.validatePasswordStrength(userData.passwordHash);
      if (!passwordValidation.isValid) {
        throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
      }
      userData.passwordHash = await PasswordUtils.hashPassword(userData.passwordHash);
    }

    return this.userRepository.update(id, userData);
  }

  async deleteUser(id: string): Promise<boolean> {
    const existing = await this.userRepository.findById(id);
    if (!existing) {
      throw new Error('User not found');
    }

    return this.userRepository.delete(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async getUsersByRole(role: User['role']): Promise<User[]> {
    const allUsers = await this.userRepository.findAll();
    return allUsers.filter(user => user.role === role);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.updateLastLogin(id);
  }

  async deactivateUser(id: string): Promise<User | null> {
    return this.userRepository.update(id, { isActive: false });
  }

  async activateUser(id: string): Promise<User | null> {
    return this.userRepository.update(id, { isActive: true });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal whether email exists for security
      console.log(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = JWTUtils.generateTokenId();
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token to database
    await this.userRepository.setPasswordResetToken(user.id, resetToken, resetTokenExpires);

    // In production, this would send an actual email
    console.log('🔐 Password Reset Information:');
    console.log(`User: ${user.email} (${user.name})`);
    console.log(`Reset Token: ${resetToken}`);
    console.log(`Reset Link: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`);
    console.log(`Token Expires: ${resetTokenExpires.toISOString()}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Find user by valid reset token
    const user = await this.userRepository.findByResetToken(token);
    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Validate new password strength
    const passwordValidation = PasswordUtils.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Hash new password
    const hashedPassword = await PasswordUtils.hashPassword(newPassword);

    // Update password and clear password change requirement
    await this.userRepository.update(user.id, {
      passwordHash: hashedPassword,
      requiresPasswordChange: false
    });

    // Clear the reset token
    await this.userRepository.setPasswordResetToken(user.id, null, null);

    console.log(`✅ Password reset successfully for user: ${user.email}`);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await PasswordUtils.verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password strength
    const passwordValidation = PasswordUtils.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Hash new password
    const newPasswordHash = await PasswordUtils.hashPassword(newPassword);

    // Update password and clear password change requirement
    await this.userRepository.update(userId, {
      passwordHash: newPasswordHash,
      requiresPasswordChange: false
    });

    console.log(`✅ Password changed successfully for user: ${user.email}`);
  }

  async forcePasswordChange(userId: string): Promise<void> {
    await this.userRepository.setRequiresPasswordChange(userId, true);
    console.log(`⚠️  Password change required for user ID: ${userId}`);
  }

  async validateResetToken(token: string): Promise<{ isValid: boolean; email?: string }> {
    const user = await this.userRepository.findByResetToken(token);
    if (!user) {
      return { isValid: false };
    }

    return { 
      isValid: true, 
      email: user.email 
    };
  }

  async getUserByResetToken(token: string): Promise<User | null> {
    return this.userRepository.findByResetToken(token);
  }
}