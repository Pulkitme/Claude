/**
 * Authentication Middleware
 * Verifies Firebase ID tokens and attaches user info to request
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyIdToken } from '../config/firebase';
import { query } from '../config/database';

/**
 * Middleware to verify Firebase authentication token
 * Attaches user information to request object
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided',
      });
    }

    const idToken = authHeader.split('Bearer ')[1];

    // Verify Firebase token
    const decodedToken = await verifyIdToken(idToken);

    // Get user from database
    const result = await query(
      'SELECT id, firebase_uid, email, paired_with FROM users WHERE firebase_uid = $1 AND is_active = true',
      [decodedToken.uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Attach user to request
    req.user = {
      id: result.rows[0].id,
      firebaseUid: result.rows[0].firebase_uid,
      email: result.rows[0].email,
      pairedWith: result.rows[0].paired_with,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

/**
 * Middleware to ensure user is paired
 * Must be used after authenticate middleware
 */
export const requirePaired = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.pairedWith) {
    return res.status(403).json({
      success: false,
      error: 'This action requires you to be paired with a partner',
    });
  }
  next();
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that work differently for authenticated users
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);

    const result = await query(
      'SELECT id, firebase_uid, email, paired_with FROM users WHERE firebase_uid = $1 AND is_active = true',
      [decodedToken.uid]
    );

    if (result.rows.length > 0) {
      req.user = {
        id: result.rows[0].id,
        firebaseUid: result.rows[0].firebase_uid,
        email: result.rows[0].email,
        pairedWith: result.rows[0].paired_with,
      };
    }

    next();
  } catch (error) {
    // Silently fail and continue without authentication
    next();
  }
};
