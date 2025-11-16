/**
 * User Routes
 * Handles user profile management
 */

import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest, UpdateUserDTO } from '../types';
import { query } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/v1/users/profile
 * Get user's full profile
 */
router.get(
  '/profile',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    const result = await query(
      `SELECT
        id, email, display_name, profile_photo_url, phone_number,
        paired_with, created_at, updated_at
       FROM users
       WHERE id = $1 AND is_active = true`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  })
);

/**
 * PUT /api/v1/users/profile
 * Update user profile
 */
router.put(
  '/profile',
  authenticate,
  [
    body('displayName').optional().trim().isLength({ min: 1, max: 100 }),
    body('profilePhotoUrl').optional().isURL(),
    body('phoneNumber').optional().trim(),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const userId = req.user?.id;
    const { displayName, profilePhotoUrl, phoneNumber }: UpdateUserDTO =
      req.body;

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (displayName !== undefined) {
      updates.push(`display_name = $${paramCount}`);
      values.push(displayName);
      paramCount++;
    }

    if (profilePhotoUrl !== undefined) {
      updates.push(`profile_photo_url = $${paramCount}`);
      values.push(profilePhotoUrl);
      paramCount++;
    }

    if (phoneNumber !== undefined) {
      updates.push(`phone_number = $${paramCount}`);
      values.push(phoneNumber);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
    }

    values.push(userId);

    const result = await query(
      `UPDATE users
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, email, display_name, profile_photo_url, phone_number, updated_at`,
      values
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Profile updated successfully',
    });
  })
);

/**
 * GET /api/v1/users/settings
 * Get user settings
 */
router.get(
  '/settings',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    const result = await query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Create default settings if they don't exist
      const newSettings = await query(
        `INSERT INTO user_settings (user_id)
         VALUES ($1)
         RETURNING *`,
        [userId]
      );
      return res.json({
        success: true,
        data: newSettings.rows[0],
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  })
);

/**
 * PUT /api/v1/users/settings
 * Update user settings
 */
router.put(
  '/settings',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const settings = req.body;

    // Build update query dynamically based on provided fields
    const allowedFields = [
      'notification_enabled',
      'daily_question_time',
      'event_reminders',
      'new_post_notifications',
      'theme',
      'language',
      'timezone',
    ];

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    for (const field of allowedFields) {
      if (settings[field] !== undefined) {
        updates.push(`${field} = $${paramCount}`);
        values.push(settings[field]);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update',
      });
    }

    values.push(userId);

    const result = await query(
      `UPDATE user_settings
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $${paramCount}
       RETURNING *`,
      values
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Settings updated successfully',
    });
  })
);

export default router;
