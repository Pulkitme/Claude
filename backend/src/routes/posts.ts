/**
 * Shared Posts Routes (Shared Hub Feature)
 * Handles shared timeline posts - photos, videos, text, voice messages
 */

import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest, CreatePostDTO } from '../types';
import { query } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, requirePaired } from '../middleware/auth';
import { generatePairId, parsePaginationParams } from '../utils/helpers';

const router = express.Router();

/**
 * GET /api/v1/posts
 * Get all shared posts for the pair (timeline)
 */
router.get(
  '/',
  authenticate,
  requirePaired,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const partnerId = req.user?.pairedWith;
    const { page, limit, offset } = parsePaginationParams(req.query);

    // Generate pair ID
    const pairId = generatePairId(userId!, partnerId!);

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) FROM shared_posts WHERE pair_id = $1',
      [pairId]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get posts with author info and reactions
    const postsResult = await query(
      `SELECT
        p.id, p.pair_id, p.author_id, p.post_type, p.content,
        p.media_url, p.media_thumbnail_url, p.duration_seconds,
        p.created_at, p.updated_at,
        u.display_name as author_name, u.profile_photo_url as author_photo,
        (
          SELECT json_agg(json_build_object(
            'id', r.id,
            'userId', r.user_id,
            'reactionType', r.reaction_type,
            'createdAt', r.created_at
          ))
          FROM post_reactions r
          WHERE r.post_id = p.id
        ) as reactions
       FROM shared_posts p
       JOIN users u ON p.author_id = u.id
       WHERE p.pair_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [pairId, limit, offset]
    );

    const posts = postsResult.rows.map((post) => ({
      id: post.id,
      pairId: post.pair_id,
      authorId: post.author_id,
      postType: post.post_type,
      content: post.content,
      mediaUrl: post.media_url,
      mediaThumbnailUrl: post.media_thumbnail_url,
      durationSeconds: post.duration_seconds,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      author: {
        id: post.author_id,
        displayName: post.author_name,
        profilePhotoUrl: post.author_photo,
      },
      reactions: post.reactions || [],
    }));

    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
);

/**
 * POST /api/v1/posts
 * Create a new shared post
 */
router.post(
  '/',
  authenticate,
  requirePaired,
  [
    body('postType')
      .isIn(['text', 'photo', 'video', 'voice'])
      .withMessage('Invalid post type'),
    body('content').optional().trim(),
    body('mediaUrl').optional().isURL().withMessage('Invalid media URL'),
    body('mediaThumbnailUrl').optional().isURL(),
    body('durationSeconds').optional().isInt({ min: 0 }),
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
    const partnerId = req.user?.pairedWith;
    const {
      postType,
      content,
      mediaUrl,
      mediaThumbnailUrl,
      durationSeconds,
    }: CreatePostDTO = req.body;

    // Generate pair ID
    const pairId = generatePairId(userId!, partnerId!);

    // Validate based on post type
    if (postType === 'text' && !content) {
      return res.status(400).json({
        success: false,
        error: 'Text posts require content',
      });
    }

    if (['photo', 'video', 'voice'].includes(postType) && !mediaUrl) {
      return res.status(400).json({
        success: false,
        error: `${postType} posts require mediaUrl`,
      });
    }

    // Create post
    const result = await query(
      `INSERT INTO shared_posts
       (pair_id, author_id, post_type, content, media_url, media_thumbnail_url, duration_seconds)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        pairId,
        userId,
        postType,
        content || null,
        mediaUrl || null,
        mediaThumbnailUrl || null,
        durationSeconds || null,
      ]
    );

    const post = result.rows[0];

    // Get author info
    const authorResult = await query(
      'SELECT display_name, profile_photo_url FROM users WHERE id = $1',
      [userId]
    );

    const author = authorResult.rows[0];

    // TODO: Send push notification to partner

    res.status(201).json({
      success: true,
      data: {
        ...post,
        author: {
          id: userId,
          displayName: author.display_name,
          profilePhotoUrl: author.profile_photo_url,
        },
        reactions: [],
      },
      message: 'Post created successfully',
    });
  })
);

/**
 * GET /api/v1/posts/:id
 * Get a specific post by ID
 */
router.get(
  '/:id',
  authenticate,
  requirePaired,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const partnerId = req.user?.pairedWith;
    const pairId = generatePairId(userId!, partnerId!);

    const result = await query(
      `SELECT
        p.id, p.pair_id, p.author_id, p.post_type, p.content,
        p.media_url, p.media_thumbnail_url, p.duration_seconds,
        p.created_at, p.updated_at,
        u.display_name as author_name, u.profile_photo_url as author_photo,
        (
          SELECT json_agg(json_build_object(
            'id', r.id,
            'userId', r.user_id,
            'reactionType', r.reaction_type,
            'createdAt', r.created_at
          ))
          FROM post_reactions r
          WHERE r.post_id = p.id
        ) as reactions
       FROM shared_posts p
       JOIN users u ON p.author_id = u.id
       WHERE p.id = $1 AND p.pair_id = $2`,
      [id, pairId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    const post = result.rows[0];

    res.json({
      success: true,
      data: {
        id: post.id,
        pairId: post.pair_id,
        authorId: post.author_id,
        postType: post.post_type,
        content: post.content,
        mediaUrl: post.media_url,
        mediaThumbnailUrl: post.media_thumbnail_url,
        durationSeconds: post.duration_seconds,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        author: {
          id: post.author_id,
          displayName: post.author_name,
          profilePhotoUrl: post.author_photo,
        },
        reactions: post.reactions || [],
      },
    });
  })
);

/**
 * DELETE /api/v1/posts/:id
 * Delete a post (only author can delete)
 */
router.delete(
  '/:id',
  authenticate,
  requirePaired,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    // Check if user is the author
    const postCheck = await query(
      'SELECT author_id FROM shared_posts WHERE id = $1',
      [id]
    );

    if (postCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    if (postCheck.rows[0].author_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own posts',
      });
    }

    // Delete post (cascade will delete reactions)
    await query('DELETE FROM shared_posts WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  })
);

/**
 * POST /api/v1/posts/:id/react
 * Add or update reaction to a post
 */
router.post(
  '/:id/react',
  authenticate,
  requirePaired,
  [
    body('reactionType')
      .optional()
      .isIn(['like', 'love', 'laugh', 'wow', 'sad', 'angry'])
      .withMessage('Invalid reaction type'),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const partnerId = req.user?.pairedWith;
    const { reactionType = 'like' } = req.body;
    const pairId = generatePairId(userId!, partnerId!);

    // Verify post belongs to pair
    const postCheck = await query(
      'SELECT id FROM shared_posts WHERE id = $1 AND pair_id = $2',
      [id, pairId]
    );

    if (postCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    // Upsert reaction (insert or update)
    const result = await query(
      `INSERT INTO post_reactions (post_id, user_id, reaction_type)
       VALUES ($1, $2, $3)
       ON CONFLICT (post_id, user_id)
       DO UPDATE SET reaction_type = $3, created_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [id, userId, reactionType]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Reaction added successfully',
    });
  })
);

/**
 * DELETE /api/v1/posts/:id/react
 * Remove reaction from a post
 */
router.delete(
  '/:id/react',
  authenticate,
  requirePaired,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    await query(
      'DELETE FROM post_reactions WHERE post_id = $1 AND user_id = $2',
      [id, userId]
    );

    res.json({
      success: true,
      message: 'Reaction removed successfully',
    });
  })
);

export default router;
