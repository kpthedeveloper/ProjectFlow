import { Request, Response, NextFunction } from 'express';
import { JWTUtils } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from httpOnly cookie
    const accessToken = req.cookies?.access_token;

    if (!accessToken) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'MISSING_TOKEN'
      });
    }

    // Verify access token
    const decoded = JWTUtils.verifyAccessToken(accessToken);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Access token expired',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid access token',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(500).json({ 
      error: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'FORBIDDEN'
      });
    }

    next();
  };
};

// Convenience middleware for common roles
export const requireAdmin = requireRole(['admin']);
export const requireManagerOrAdmin = requireRole(['admin', 'manager']);
export const requireAnyAuthenticated = requireRole(['admin', 'manager', 'user']);