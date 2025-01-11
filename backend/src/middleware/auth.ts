import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';

export interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Authorization header:', req.headers.authorization);

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    // Accept both "Bearer <token>" and just "<token>" formats
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      let userId: string;

      // Try verifying as an ID token first
      try {
        const decodedToken = await auth.verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (idTokenError) {
        console.log('Not an ID token, trying to get user from token...');
        // If it's not an ID token, try to get the user directly
        // This works with custom tokens
        const decodedToken = await auth.verifySessionCookie(token, true).catch(async () => {
          // If it's a custom token, get the user from the token payload
          const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          return { uid: decoded.uid };
        });
        userId = decodedToken.uid;
      }

      // Verify the user exists
      const userRecord = await auth.getUser(userId);
      console.log('User record:', userRecord);

      req.user = {
        id: userRecord.uid
      };
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ error: 'Please authenticate' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}; 