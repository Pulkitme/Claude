/**
 * Daily Questions Routes
 * Handles daily relationship questions and answers
 */

import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest, CreateAnswerDTO } from '../types';
import { query } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, requirePaired } from '../middleware/auth';
import { generatePairId } from '../utils/helpers';

const router = express.Router();

/**
 * GET /api/v1/questions/today
 * Get today's daily question for the pair
 */
router.get(
  '/today',
  authenticate,
  requirePaired,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const partnerId = req.user?.pairedWith;
    const pairId = generatePairId(userId!, partnerId!);

    const today = new Date().toISOString().split('T')[0];

    // Get today's scheduled question
    const scheduleResult = await query(
      `SELECT
        s.id as schedule_id, s.scheduled_date, s.delivered_at,
        q.id as question_id, q.question_text, q.category, q.difficulty_level
       FROM daily_question_schedule s
       JOIN daily_questions q ON s.question_id = q.id
       WHERE s.pair_id = $1 AND s.scheduled_date = $2`,
      [pairId, today]
    );

    let schedule = scheduleResult.rows[0];

    // If no question scheduled for today, create one
    if (!schedule) {
      // Get a random question that hasn't been asked to this pair
      const questionResult = await query(
        `SELECT id, question_text, category, difficulty_level
         FROM daily_questions
         WHERE is_active = true
           AND id NOT IN (
             SELECT question_id FROM daily_question_schedule WHERE pair_id = $1
           )
         ORDER BY RANDOM()
         LIMIT 1`,
        [pairId]
      );

      if (questionResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No more questions available',
        });
      }

      const question = questionResult.rows[0];

      // Schedule the question
      const newSchedule = await query(
        `INSERT INTO daily_question_schedule (pair_id, question_id, scheduled_date, delivered_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         RETURNING id as schedule_id, scheduled_date, delivered_at`,
        [pairId, question.id, today]
      );

      schedule = {
        ...newSchedule.rows[0],
        question_id: question.id,
        question_text: question.question_text,
        category: question.category,
        difficulty_level: question.difficulty_level,
      };
    }

    // Get answers from both users
    const answersResult = await query(
      `SELECT
        a.id, a.user_id, a.answer_text, a.created_at,
        u.display_name, u.profile_photo_url
       FROM daily_question_answers a
       JOIN users u ON a.user_id = u.id
       WHERE a.schedule_id = $1`,
      [schedule.schedule_id]
    );

    const answers = answersResult.rows.map((a) => ({
      id: a.id,
      userId: a.user_id,
      answerText: a.answer_text,
      createdAt: a.created_at,
      user: {
        displayName: a.display_name,
        profilePhotoUrl: a.profile_photo_url,
      },
    }));

    const userAnswer = answers.find((a) => a.userId === userId);
    const partnerAnswer = answers.find((a) => a.userId === partnerId);

    res.json({
      success: true,
      data: {
        scheduleId: schedule.schedule_id,
        questionId: schedule.question_id,
        questionText: schedule.question_text,
        category: schedule.category,
        difficultyLevel: schedule.difficulty_level,
        scheduledDate: schedule.scheduled_date,
        userAnswer,
        partnerAnswer: userAnswer ? partnerAnswer : null, // Only show partner answer if user has answered
      },
    });
  })
);

/**
 * POST /api/v1/questions/:scheduleId/answer
 * Submit answer to a daily question
 */
router.post(
  '/:scheduleId/answer',
  authenticate,
  requirePaired,
  [body('answerText').notEmpty().trim().isLength({ max: 2000 })],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { scheduleId } = req.params;
    const userId = req.user?.id;
    const partnerId = req.user?.pairedWith;
    const pairId = generatePairId(userId!, partnerId!);
    const { answerText }: CreateAnswerDTO = req.body;

    // Verify schedule belongs to pair
    const scheduleCheck = await query(
      'SELECT id FROM daily_question_schedule WHERE id = $1 AND pair_id = $2',
      [scheduleId, pairId]
    );

    if (scheduleCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Question not found',
      });
    }

    // Insert or update answer
    const result = await query(
      `INSERT INTO daily_question_answers (schedule_id, user_id, answer_text)
       VALUES ($1, $2, $3)
       ON CONFLICT (schedule_id, user_id)
       DO UPDATE SET answer_text = $3, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [scheduleId, userId, answerText]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Answer submitted successfully',
    });
  })
);

/**
 * GET /api/v1/questions/history
 * Get past questions and answers
 */
router.get(
  '/history',
  authenticate,
  requirePaired,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const partnerId = req.user?.pairedWith;
    const pairId = generatePairId(userId!, partnerId!);
    const { limit = 30, offset = 0 } = req.query;

    const result = await query(
      `SELECT
        s.id as schedule_id, s.scheduled_date,
        q.question_text, q.category,
        (
          SELECT json_agg(json_build_object(
            'userId', a.user_id,
            'answerText', a.answer_text,
            'createdAt', a.created_at,
            'displayName', u.display_name
          ))
          FROM daily_question_answers a
          JOIN users u ON a.user_id = u.id
          WHERE a.schedule_id = s.id
        ) as answers
       FROM daily_question_schedule s
       JOIN daily_questions q ON s.question_id = q.id
       WHERE s.pair_id = $1
       ORDER BY s.scheduled_date DESC
       LIMIT $2 OFFSET $3`,
      [pairId, limit, offset]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  })
);

export default router;
