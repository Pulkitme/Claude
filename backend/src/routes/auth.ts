/**
 * Authentication Routes
 * Handles user registration and authentication
 */

import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest, CreateUserDTO } from '../types';
import { query } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * POST /api/v1/auth/register
 * Register a new user (called after Firebase authentication)
 */
router.post(
  '/register',
  [
    body('firebaseUid').notEmpty().withMessage('Firebase UID is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('displayName').optional().trim(),
    body('profilePhotoUrl').optional().isURL().withMessage('Invalid URL'),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { firebaseUid, email, displayName, profilePhotoUrl }: CreateUserDTO =
      req.body;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE firebase_uid = $1 OR email = $2',
      [firebaseUid, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'User already exists',
      });
    }

    // Create new user
    const result = await query(
      `INSERT INTO users (firebase_uid, email, display_name, profile_photo_url)
       VALUES ($1, $2, $3, $4)
       RETURNING id, firebase_uid, email, display_name, profile_photo_url, created_at`,
      [firebaseUid, email, displayName || null, profilePhotoUrl || null]
    );

    const user = result.rows[0];

    // Create default user settings
    await query(
      'INSERT INTO user_settings (user_id) VALUES ($1)',
      [user.id]
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          firebaseUid: user.firebase_uid,
          email: user.email,
          displayName: user.display_name,
          profilePhotoUrl: user.profile_photo_url,
          createdAt: user.created_at,
        },
      },
      message: 'User registered successfully',
    });
  })
);

/**
 * GET /api/v1/auth/me
 * Get current authenticated user's information
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    const result = await query(
      `SELECT
        u.id, u.firebase_uid, u.email, u.display_name, u.profile_photo_url,
        u.phone_number, u.paired_with, u.created_at,
        p.id as partner_id, p.display_name as partner_name,
        p.profile_photo_url as partner_photo
       FROM users u
       LEFT JOIN users p ON u.paired_with = p.id
       WHERE u.id = $1 AND u.is_active = true`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        id: user.id,
        firebaseUid: user.firebase_uid,
        email: user.email,
        displayName: user.display_name,
        profilePhotoUrl: user.profile_photo_url,
        phoneNumber: user.phone_number,
        isPaired: !!user.paired_with,
        partner: user.paired_with
          ? {
              id: user.partner_id,
              displayName: user.partner_name,
              profilePhotoUrl: user.partner_photo,
            }
          : null,
        createdAt: user.created_at,
      },
    });
  })
);

/**
 * DELETE /api/v1/auth/account
 * Delete user account
 */
router.delete(
  '/account',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    // Soft delete (mark as inactive)
    await query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  })
);

export default router;
