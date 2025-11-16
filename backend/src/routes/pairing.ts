/**
 * Pairing Routes
 * Handles user pairing via invite codes
 */

import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../types';
import { query, transaction } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import {
  generateInviteCode,
  calculateExpiryDate,
  isExpired,
} from '../utils/helpers';

const router = express.Router();

/**
 * POST /api/v1/pairing/generate-code
 * Generate a new invite code for pairing
 */
router.post(
  '/generate-code',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    // Check if user is already paired
    const userCheck = await query(
      'SELECT paired_with FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows[0]?.paired_with) {
      return res.status(400).json({
        success: false,
        error: 'You are already paired with a partner',
      });
    }

    // Generate unique invite code
    let inviteCode: string;
    let isUnique = false;

    while (!isUnique) {
      inviteCode = generateInviteCode(
        parseInt(process.env.INVITE_CODE_LENGTH || '8')
      );

      const existing = await query(
        'SELECT id FROM users WHERE invite_code = $1',
        [inviteCode]
      );

      if (existing.rows.length === 0) {
        isUnique = true;
      }
    }

    // Calculate expiry date
    const expiryHours = parseInt(process.env.INVITE_CODE_EXPIRY_HOURS || '72');
    const expiresAt = calculateExpiryDate(expiryHours);

    // Update user with invite code
    await query(
      `UPDATE users
       SET invite_code = $1, invite_code_expires_at = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [inviteCode!, expiresAt, userId]
    );

    res.json({
      success: true,
      data: {
        inviteCode: inviteCode!,
        expiresAt,
      },
      message: 'Invite code generated successfully',
    });
  })
);

/**
 * POST /api/v1/pairing/accept-code
 * Accept an invite code to pair with another user
 */
router.post(
  '/accept-code',
  authenticate,
  [body('inviteCode').notEmpty().withMessage('Invite code is required')],
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
    const { inviteCode } = req.body;

    // Use transaction to ensure atomic pairing
    const result = await transaction(async (client) => {
      // Check if current user is already paired
      const userCheck = await client.query(
        'SELECT paired_with FROM users WHERE id = $1',
        [userId]
      );

      if (userCheck.rows[0]?.paired_with) {
        throw new Error('You are already paired with a partner');
      }

      // Find user with invite code
      const inviterResult = await client.query(
        `SELECT id, email, display_name, invite_code_expires_at, paired_with
         FROM users
         WHERE invite_code = $1 AND is_active = true`,
        [inviteCode]
      );

      if (inviterResult.rows.length === 0) {
        throw new Error('Invalid invite code');
      }

      const inviter = inviterResult.rows[0];

      // Check if inviter is current user
      if (inviter.id === userId) {
        throw new Error('You cannot pair with yourself');
      }

      // Check if invite code is expired
      if (isExpired(inviter.invite_code_expires_at)) {
        throw new Error('Invite code has expired');
      }

      // Check if inviter is already paired
      if (inviter.paired_with) {
        throw new Error('This user is already paired with someone else');
      }

      // Create pair request record
      await client.query(
        `INSERT INTO pair_requests (requester_id, recipient_id, invite_code, status, responded_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
        [inviter.id, userId, inviteCode, 'accepted']
      );

      // Update both users with pairing
      await client.query(
        `UPDATE users
         SET paired_with = $1, invite_code = NULL, invite_code_expires_at = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [userId, inviter.id]
      );

      await client.query(
        `UPDATE users
         SET paired_with = $1, invite_code = NULL, invite_code_expires_at = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [inviter.id, userId]
      );

      return {
        partnerId: inviter.id,
        partnerName: inviter.display_name,
        partnerEmail: inviter.email,
      };
    });

    res.json({
      success: true,
      data: result,
      message: 'Successfully paired with partner!',
    });
  })
);

/**
 * GET /api/v1/pairing/status
 * Get current pairing status
 */
router.get(
  '/status',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    const result = await query(
      `SELECT
        u.paired_with, u.invite_code, u.invite_code_expires_at,
        p.id as partner_id, p.display_name as partner_name,
        p.email as partner_email, p.profile_photo_url as partner_photo
       FROM users u
       LEFT JOIN users p ON u.paired_with = p.id
       WHERE u.id = $1`,
      [userId]
    );

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        isPaired: !!user.paired_with,
        inviteCode: user.invite_code,
        inviteCodeExpiresAt: user.invite_code_expires_at,
        partner: user.paired_with
          ? {
              id: user.partner_id,
              displayName: user.partner_name,
              email: user.partner_email,
              profilePhotoUrl: user.partner_photo,
            }
          : null,
      },
    });
  })
);

/**
 * DELETE /api/v1/pairing/unpair
 * Unpair from current partner
 */
router.delete(
  '/unpair',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    await transaction(async (client) => {
      // Get partner ID
      const userResult = await client.query(
        'SELECT paired_with FROM users WHERE id = $1',
        [userId]
      );

      const partnerId = userResult.rows[0]?.paired_with;

      if (!partnerId) {
        throw new Error('You are not currently paired');
      }

      // Unpair both users
      await client.query(
        `UPDATE users
         SET paired_with = NULL, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 OR id = $2`,
        [userId, partnerId]
      );

      // Update pair request status
      await client.query(
        `UPDATE pair_requests
         SET status = 'rejected'
         WHERE (requester_id = $1 AND recipient_id = $2)
            OR (requester_id = $2 AND recipient_id = $1)`,
        [userId, partnerId]
      );
    });

    res.json({
      success: true,
      message: 'Successfully unpaired from partner',
    });
  })
);

export default router;
