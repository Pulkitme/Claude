/**
 * Calendar Events Routes
 * Handles shared calendar events
 */

import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest, CreateEventDTO } from '../types';
import { query } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, requirePaired } from '../middleware/auth';
import { generatePairId, parsePaginationParams } from '../utils/helpers';

const router = express.Router();

/**
 * GET /api/v1/calendar/events
 * Get calendar events for a date range
 */
router.get(
  '/events',
  authenticate,
  requirePaired,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const partnerId = req.user?.pairedWith;
    const pairId = generatePairId(userId!, partnerId!);

    const { startDate, endDate } = req.query;

    let queryText = `
      SELECT * FROM calendar_events
      WHERE pair_id = $1
    `;
    const params: any[] = [pairId];

    if (startDate) {
      params.push(startDate);
      queryText += ` AND event_date >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      queryText += ` AND event_date <= $${params.length}`;
    }

    queryText += ' ORDER BY event_date ASC';

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows,
    });
  })
);

/**
 * POST /api/v1/calendar/events
 * Create a new calendar event
 */
router.post(
  '/events',
  authenticate,
  requirePaired,
  [
    body('title').notEmpty().trim().isLength({ max: 200 }),
    body('eventDate').isISO8601().withMessage('Invalid date format'),
    body('endDate').optional().isISO8601(),
    body('description').optional().trim(),
    body('category').optional().trim(),
    body('color').optional().matches(/^#[0-9A-F]{6}$/i),
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

    const eventData: CreateEventDTO = req.body;

    const result = await query(
      `INSERT INTO calendar_events
       (pair_id, created_by, title, description, event_date, end_date,
        is_all_day, category, color, location, reminder_minutes, is_recurring, recurrence_rule)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        pairId,
        userId,
        eventData.title,
        eventData.description || null,
        eventData.eventDate,
        eventData.endDate || null,
        eventData.isAllDay || false,
        eventData.category || null,
        eventData.color || null,
        eventData.location || null,
        eventData.reminderMinutes || null,
        eventData.isRecurring || false,
        eventData.recurrenceRule || null,
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Event created successfully',
    });
  })
);

/**
 * PUT /api/v1/calendar/events/:id
 * Update a calendar event
 */
router.put(
  '/events/:id',
  authenticate,
  requirePaired,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const partnerId = req.user?.pairedWith;
    const pairId = generatePairId(userId!, partnerId!);

    // Verify event belongs to pair
    const check = await query(
      'SELECT id FROM calendar_events WHERE id = $1 AND pair_id = $2',
      [id, pairId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    const updateData = req.body;
    const allowedFields = [
      'title', 'description', 'event_date', 'end_date', 'is_all_day',
      'category', 'color', 'location', 'reminder_minutes', 'is_recurring', 'recurrence_rule'
    ];

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

    values.push(id);

    const result = await query(
      `UPDATE calendar_events
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Event updated successfully',
    });
  })
);

/**
 * DELETE /api/v1/calendar/events/:id
 * Delete a calendar event
 */
router.delete(
  '/events/:id',
  authenticate,
  requirePaired,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const partnerId = req.user?.pairedWith;
    const pairId = generatePairId(userId!, partnerId!);

    const result = await query(
      'DELETE FROM calendar_events WHERE id = $1 AND pair_id = $2',
      [id, pairId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  })
);

export default router;
