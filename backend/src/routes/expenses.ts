/**
 * Expenses Routes
 * Handles shared expense tracking
 */

import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest, CreateExpenseDTO } from '../types';
import { query } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, requirePaired } from '../middleware/auth';
import { generatePairId, parsePaginationParams } from '../utils/helpers';

const router = express.Router();

/**
 * GET /api/v1/expenses
 * Get all expenses for the pair
 */
router.get(
  '/',
  authenticate,
  requirePaired,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const partnerId = req.user?.pairedWith;
    const pairId = generatePairId(userId!, partnerId!);
    const { page, limit, offset } = parsePaginationParams(req.query);
    const { category, startDate, endDate } = req.query;

    let queryText = 'SELECT * FROM expenses WHERE pair_id = $1';
    const params: any[] = [pairId];

    if (category) {
      params.push(category);
      queryText += ` AND category = $${params.length}`;
    }

    if (startDate) {
      params.push(startDate);
      queryText += ` AND expense_date >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      queryText += ` AND expense_date <= $${params.length}`;
    }

    // Get total count
    const countQuery = queryText.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Get expenses
    queryText += ` ORDER BY expense_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows,
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
 * POST /api/v1/expenses
 * Create a new expense
 */
router.post(
  '/',
  authenticate,
  requirePaired,
  [
    body('title').notEmpty().trim().isLength({ max: 200 }),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('expenseDate').isISO8601().withMessage('Invalid date format'),
    body('currency').optional().isLength({ min: 3, max: 3 }),
    body('splitType').optional().isIn(['equal', 'custom', 'percentage']),
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
    const expenseData: CreateExpenseDTO = req.body;

    // Default split ratio for equal split
    let splitRatio = expenseData.splitRatio;
    if (expenseData.splitType === 'equal' || !splitRatio) {
      splitRatio = {
        [userId!]: 0.5,
        [partnerId!]: 0.5,
      };
    }

    const result = await query(
      `INSERT INTO expenses
       (pair_id, added_by, title, amount, currency, category, expense_date,
        paid_by, split_type, split_ratio, notes, receipt_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        pairId,
        userId,
        expenseData.title,
        expenseData.amount,
        expenseData.currency || 'USD',
        expenseData.category || null,
        expenseData.expenseDate,
        expenseData.paidBy || userId,
        expenseData.splitType || 'equal',
        JSON.stringify(splitRatio),
        expenseData.notes || null,
        expenseData.receiptUrl || null,
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Expense added successfully',
    });
  })
);

/**
 * GET /api/v1/expenses/summary
 * Get expense summary and statistics
 */
router.get(
  '/summary',
  authenticate,
  requirePaired,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const partnerId = req.user?.pairedWith;
    const pairId = generatePairId(userId!, partnerId!);
    const { month, year } = req.query;

    // Build date filter
    let dateFilter = '';
    const params: any[] = [pairId];

    if (month && year) {
      params.push(`${year}-${String(month).padStart(2, '0')}-01`);
      params.push(`${year}-${String(month).padStart(2, '0')}-31`);
      dateFilter = ` AND expense_date >= $2 AND expense_date <= $3`;
    }

    // Total expenses
    const totalResult = await query(
      `SELECT SUM(amount) as total FROM expenses WHERE pair_id = $1${dateFilter}`,
      params
    );

    // By category
    const categoryResult = await query(
      `SELECT category, SUM(amount) as total, COUNT(*) as count
       FROM expenses
       WHERE pair_id = $1${dateFilter}
       GROUP BY category
       ORDER BY total DESC`,
      params
    );

    // Who paid what
    const paidByResult = await query(
      `SELECT paid_by, SUM(amount) as total
       FROM expenses
       WHERE pair_id = $1${dateFilter}
       GROUP BY paid_by`,
      params
    );

    res.json({
      success: true,
      data: {
        total: parseFloat(totalResult.rows[0]?.total || 0),
        byCategory: categoryResult.rows,
        paidBy: paidByResult.rows,
      },
    });
  })
);

/**
 * PUT /api/v1/expenses/:id
 * Update an expense
 */
router.put(
  '/:id',
  authenticate,
  requirePaired,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const partnerId = req.user?.pairedWith;
    const pairId = generatePairId(userId!, partnerId!);

    // Verify expense belongs to pair
    const check = await query(
      'SELECT id FROM expenses WHERE id = $1 AND pair_id = $2',
      [id, pairId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found',
      });
    }

    const updateData = req.body;
    const allowedFields = [
      'title', 'amount', 'currency', 'category', 'expense_date',
      'paid_by', 'split_type', 'split_ratio', 'notes', 'receipt_url'
    ];

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        if (field === 'split_ratio') {
          updates.push(`${field} = $${paramCount}`);
          values.push(JSON.stringify(updateData[field]));
        } else {
          updates.push(`${field} = $${paramCount}`);
          values.push(updateData[field]);
        }
        paramCount++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
    }

    values.push(id);

    const result = await query(
      `UPDATE expenses
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Expense updated successfully',
    });
  })
);

/**
 * DELETE /api/v1/expenses/:id
 * Delete an expense
 */
router.delete(
  '/:id',
  authenticate,
  requirePaired,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const partnerId = req.user?.pairedWith;
    const pairId = generatePairId(userId!, partnerId!);

    const result = await query(
      'DELETE FROM expenses WHERE id = $1 AND pair_id = $2',
      [id, pairId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found',
      });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  })
);

export default router;
