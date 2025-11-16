/**
 * Utility Helper Functions
 */

import crypto from 'crypto';

/**
 * Generate a unique invite code
 * @param length Length of the invite code (default: 8)
 * @returns Random alphanumeric invite code
 */
export const generateInviteCode = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    code += chars[randomIndex];
  }

  return code;
};

/**
 * Generate a deterministic pair ID from two user IDs
 * Ensures both users get the same pair ID regardless of order
 * @param userId1 First user ID
 * @param userId2 Second user ID
 * @returns Deterministic pair ID
 */
export const generatePairId = (userId1: string, userId2: string): string => {
  // Sort IDs to ensure deterministic result
  const sortedIds = [userId1, userId2].sort();
  const combined = sortedIds.join('_');

  // Create hash
  return crypto.createHash('sha256').update(combined).digest('hex');
};

/**
 * Calculate expiry date for invite codes
 * @param hours Number of hours until expiry
 * @returns Date object for expiry time
 */
export const calculateExpiryDate = (hours: number = 72): Date => {
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + hours);
  return expiryDate;
};

/**
 * Check if a date has expired
 * @param date Date to check
 * @returns True if expired, false otherwise
 */
export const isExpired = (date: Date): boolean => {
  return new Date() > new Date(date);
};

/**
 * Sanitize user input to prevent XSS
 * @param input User input string
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate email format
 * @param email Email string to validate
 * @returns True if valid email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate pagination metadata
 * @param page Current page number
 * @param limit Items per page
 * @param total Total number of items
 * @returns Pagination metadata object
 */
export const generatePagination = (
  page: number,
  limit: number,
  total: number
) => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Sleep/delay function for async operations
 * @param ms Milliseconds to sleep
 * @returns Promise that resolves after delay
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Format currency amount
 * @param amount Numeric amount
 * @param currency Currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD'
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Generate a random color hex code
 * @returns Random hex color code
 */
export const generateRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * Parse pagination query parameters
 * @param query Query object from request
 * @returns Parsed page and limit with defaults
 */
export const parsePaginationParams = (query: any) => {
  const page = parseInt(query.page as string) || 1;
  const limit = Math.min(parseInt(query.limit as string) || 20, 100); // Max 100 items
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};
