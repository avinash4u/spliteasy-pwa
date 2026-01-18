import { auth } from '../config/firebase.js';

export const authMiddleware = async (req, res, next) => {
  // If Firebase is not configured, skip authentication for testing
  if (!auth) {
    console.log('⚠️  Firebase authentication bypassed - credentials not configured');
    // Add a mock user for testing
    req.user = {
      uid: 'test_user_123',
      email: 'test@example.com',
      phone: '+1234567890',
      name: 'Test User',
      photoURL: null,
      emailVerified: true
    };
    return next();
  }

  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required. Format: Authorization: Bearer <token>'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decodedToken = await auth.verifyIdToken(token);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      phone: decodedToken.phone_number,
      name: decodedToken.name,
      photoURL: decodedToken.picture,
      emailVerified: decodedToken.email_verified
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        message: 'Access token has expired'
      });
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        success: false,
        message: 'Access token has been revoked'
      });
    }
    
    if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};
