// Load environment variables at the top
import dotenv from 'dotenv';
dotenv.config();

import jwt from 'jsonwebtoken';
import { User } from '../types';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  tokenId?: string;
}

export class JWTUtils {
  private static readonly ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
  private static readonly REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

  static generateAccessToken(user: User, tokenId?: string): string {
    console.log('🔐 Generating access token with secret length:', this.ACCESS_SECRET?.length);
    
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenId
    };

    return jwt.sign(payload, this.ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
      issuer: 'project-management-api',
      subject: user.id
    } as jwt.SignOptions);
  }

  static generateRefreshToken(user: User, tokenId: string): string {
    console.log('🔐 Generating refresh token with secret length:', this.REFRESH_SECRET?.length);
    
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenId
    };

    return jwt.sign(payload, this.REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
      issuer: 'project-management-api',
      subject: user.id
    } as jwt.SignOptions);
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, this.ACCESS_SECRET) as TokenPayload;
  }

  static verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, this.REFRESH_SECRET) as TokenPayload;
  }

  static decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload;
    } catch {
      return null;
    }
  }

  static generateTokenId(): string {
    return require('crypto').randomBytes(16).toString('hex');
  }
}