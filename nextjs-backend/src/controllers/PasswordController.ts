import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest } from '../types';

export class PasswordController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email }: ForgotPasswordRequest = req.body;

      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }

      await this.userService.forgotPassword(email);

      // Always return success to prevent email enumeration
      res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, newPassword }: ResetPasswordRequest = req.body;

      if (!token || !newPassword) {
        res.status(400).json({ error: 'Token and new password are required' });
        return;
      }

      await this.userService.resetPassword(token, newPassword);

      res.json({ message: 'Password has been reset successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { currentPassword, newPassword }: ChangePasswordRequest = req.body;
      const userId = (req as any).user?.userId; // From auth middleware

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: 'Current password and new password are required' });
        return;
      }

      await this.userService.changePassword(userId, currentPassword, newPassword);

      res.json({ message: 'Password changed successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}