/**
 * Shared Lists Routes
 * Handles shared lists (todo, shopping, bucket list)
 */

import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest, CreateListDTO, CreateListItemDTO } from '../types';
import { query } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, requirePaired } from '../middleware/auth';
import { generatePairId } from '../utils/helpers';

const router = express.Router();

/**
 * GET /api/v1/lists
 * Get all shared lists
 */
router.get(
  '/',
  authenticate,
  requirePaired,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const partnerId = req.user?.pairedWith;
    const pairId = generatePairId(userId!, partnerId!);
    const { listType, includeArchived } = req.query;

    let queryText = 'SELECT * FROM shared_lists WHERE pair_id = $1';
    const params: any[] = [pairId];

    if (listType) {
      params.push(listType);
      queryText += ` AND list_type = $${params.length}`;
    }

    if (includeArchived !== 'true') {
      queryText += ' AND is_archived = false';
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows,
    });
  })
);

/**
 * POST /api/v1/lists
 * Create a new list
 */
router.post(
  '/',
  authenticate,
  requirePaired,
  [
    body('listType').isIn(['todo', 'shopping', 'bucket_list', 'custom']),
    body('title').notEmpty().trim().isLength({ max: 200 }),
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
    const pairId = generatePairId(userId!, partnerId!);
    const listData: CreateListDTO = req.body;

    const result = await query(
      `INSERT INTO shared_lists (pair_id, created_by, list_type, title, description, color)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        pairId,
        userId,
        listData.listType,
        listData.title,
        listData.description || null,
        listData.color || null,
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'List created successfully',
    });
  })
);

/**
 * GET /api/v1/lists/:id/items
 * Get all items in a list
 */
router.get(
  '/:id/items',
  authenticate,
  requirePaired,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const partnerId = req.user?.pairedWith;
    const pairId = generatePairId(userId!, partnerId!);

    // Verify list belongs to pair
    const listCheck = await query(
      'SELECT id FROM shared_lists WHERE id = $1 AND pair_id = $2',
      [id, pairId]
    );

    if (listCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'List not found',
      });
    }

    const result = await query(
      `SELECT * FROM list_items
       WHERE list_id = $1
       ORDER BY position ASC, created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  })
);

/**
 * POST /api/v1/lists/:id/items
 * Add item to a list
 */
router.post(
  '/:id/items',
  authenticate,
  requirePaired,
  [body('title').notEmpty().trim().isLength({ max: 300 })],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { id } = req.params;
    const userId = req.user?.id;
    const partnerId = req.user?.pairedWith;
    const pairId = generatePairId(userId!, partnerId!);

    // Verify list belongs to pair
    const listCheck = await query(
      'SELECT id FROM shared_lists WHERE id = $1 AND pair_id = $2',
      [id, pairId]
    );

    if (listCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'List not found',
      });
    }

    const itemData: CreateListItemDTO = req.body;

    const result = await query(
      `INSERT INTO list_items
       (list_id, title, description, assigned_to, due_date, priority)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        id,
        itemData.title,
        itemData.description || null,
        itemData.assignedTo || null,
        itemData.dueDate || null,
        itemData.priority || null,
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Item added successfully',
    });
  })
);

/**
 * PUT /api/v1/lists/items/:itemId
 * Update a list item
 */
router.put(
  '/items/:itemId',
  authenticate,
  requirePaired,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { itemId } = req.params;
    const userId = req.user?.id;

    const updateData = req.body;
    const allowedFields = [
      'title', 'description', 'is_completed', 'assigned_to',
      'due_date', 'priority', 'position'
    ];

    // Handle completion
    if (updateData.is_completed === true) {
      updateData.completed_by = userId;
      updateData.completed_at = new Date();
      allowedFields.push('completed_by', 'completed_at');
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates.push(`${field} = $${paramCount}`);
        values.push(updateData[field]);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
    }

    values.push(itemId);

    const result = await query(
      `UPDATE list_items
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Item not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Item updated successfully',
    });
  })
);

/**
 * DELETE /api/v1/lists/items/:itemId
 * Delete a list item
 */
router.delete(
  '/items/:itemId',
  authenticate,
  requirePaired,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { itemId } = req.params;

    const result = await query('DELETE FROM list_items WHERE id = $1', [itemId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Item not found',
      });
    }

    res.json({
      success: true,
      message: 'Item deleted successfully',
    });
  })
);

export default router;
