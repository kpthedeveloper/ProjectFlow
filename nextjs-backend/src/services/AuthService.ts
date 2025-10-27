// services/AuthService.ts
import { UserRepository } from '../repositories/UserRepository';
import { PasswordUtils } from '../utils/password';
import { JWTUtils } from '../utils/jwt';
import { User, LoginRequest, AuthResponse } from '../types';

export class AuthService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async login(loginData: LoginRequest, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    const { email, password } = loginData;

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Check if account is locked - fix date comparison
    if (user.lockUntil) {
      const lockUntilDate = new Date(user.lockUntil);
      if (lockUntilDate > new Date()) {
        throw new Error('Account is temporarily locked due to too many failed login attempts');
      }
    }

    // Verify password
    const isPasswordValid = await PasswordUtils.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      // Increment login attempts
      const newAttempts = user.loginAttempts + 1;
      let lockUntil = null;

      // Lock account after 5 failed attempts for 15 minutes
      if (newAttempts >= 5) {
        lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }

      await this.userRepository.updateLoginAttempts(user.id, newAttempts, lockUntil);
      throw new Error('Invalid email or password');
    }

    // Reset login attempts on successful login
    await this.userRepository.updateLoginAttempts(user.id, 0, null);

    // Update last login
    await this.userRepository.updateLastLogin(user.id);

    // Generate tokens
    const tokenId = JWTUtils.generateTokenId();
    const accessToken = JWTUtils.generateAccessToken(user, tokenId);
    const refreshToken = JWTUtils.generateRefreshToken(user, tokenId);

    // Store refresh token in database (expires in 7 days)
    const refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.userRepository.updateRefreshToken(user.id, refreshToken, refreshTokenExpires);

    // Return user without sensitive data but WITH requiresPasswordChange
    const userWithoutSensitiveData = this.excludeSensitiveData(user);

    return {
      user: {
        ...userWithoutSensitiveData,
        requiresPasswordChange: user.requiresPasswordChange
      },
      accessToken,
      refreshToken,
      message: 'Login successful'
    };
  }

  async logout(userId: string): Promise<void> {
    // Clear refresh token from database
    await this.userRepository.updateRefreshToken(userId, null, null);
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Verify refresh token
    const decoded = JWTUtils.verifyRefreshToken(refreshToken);

    // Find user by refresh token
    const user = await this.userRepository.findByRefreshToken(refreshToken);
    if (!user) {
      throw new Error('Invalid refresh token');
    }

    // Generate new tokens
    const tokenId = JWTUtils.generateTokenId();
    const newAccessToken = JWTUtils.generateAccessToken(user, tokenId);
    const newRefreshToken = JWTUtils.generateRefreshToken(user, tokenId);

    // Update refresh token in database
    const refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.userRepository.updateRefreshToken(user.id, newRefreshToken, refreshTokenExpires);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  async getCurrentUser(userId: string): Promise<Omit<User, 'passwordHash' | 'refreshToken'>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const userWithoutSensitiveData = this.excludeSensitiveData(user);
    return {
      ...userWithoutSensitiveData,
      requiresPasswordChange: user.requiresPasswordChange
    };
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

    // Update password and clear the requiresPasswordChange flag
    await this.userRepository.update(userId, { 
      passwordHash: newPasswordHash,
      requiresPasswordChange: false 
    });
  }

  private excludeSensitiveData(user: User): Omit<User, 'passwordHash' | 'refreshToken'> {
    const { passwordHash, refreshToken, ...userWithoutSensitiveData } = user;
    return userWithoutSensitiveData;
  }
}