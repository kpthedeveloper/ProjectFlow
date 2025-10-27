import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.get('User-Agent');

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const result = await this.authService.login(
        { email, password },
        ipAddress,
        userAgent
      );

      // Set httpOnly cookies
      res.cookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        user: result.user,
        message: result.message
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  };

  logout = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (req.user) {
        await this.authService.logout(req.user.userId);
      }

      // Clear cookies
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      res.json({ message: 'Logout successful' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refresh_token;

      if (!refreshToken) {
        res.status(401).json({ error: 'Refresh token required' });
        return;
      }

      const tokens = await this.authService.refreshToken(refreshToken);

      // Set new cookies
      res.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({ message: 'Token refreshed successfully' });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  };

  getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const user = await this.authService.getCurrentUser(req.user.userId);
      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: 'Current password and new password are required' });
        return;
      }

      await this.authService.changePassword(req.user.userId, currentPassword, newPassword);
      res.json({ message: 'Password changed successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}