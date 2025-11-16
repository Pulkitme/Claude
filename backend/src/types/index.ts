/**
 * TypeScript Type Definitions
 */

import { Request } from 'express';

// Extend Express Request to include authenticated user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    firebaseUid: string;
    email: string;
    pairedWith?: string;
  };
}

// User types
export interface User {
  id: string;
  firebaseUid: string;
  email: string;
  displayName?: string;
  profilePhotoUrl?: string;
  phoneNumber?: string;
  pairedWith?: string;
  inviteCode?: string;
  inviteCodeExpiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  firebaseUid: string;
  email: string;
  displayName?: string;
  profilePhotoUrl?: string;
  phoneNumber?: string;
}

export interface UpdateUserDTO {
  displayName?: string;
  profilePhotoUrl?: string;
  phoneNumber?: string;
}

// Pairing types
export interface PairRequest {
  id: string;
  requesterId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  inviteCode: string;
  createdAt: Date;
  respondedAt?: Date;
}

export interface CreateInviteCodeResponse {
  inviteCode: string;
  expiresAt: Date;
}

// Shared Post types
export interface SharedPost {
  id: string;
  pairId: string;
  authorId: string;
  postType: 'text' | 'photo' | 'video' | 'voice';
  content?: string;
  mediaUrl?: string;
  mediaThumbnailUrl?: string;
  durationSeconds?: number;
  createdAt: Date;
  updatedAt: Date;
  reactions?: PostReaction[];
  author?: {
    id: string;
    displayName?: string;
    profilePhotoUrl?: string;
  };
}

export interface CreatePostDTO {
  postType: 'text' | 'photo' | 'video' | 'voice';
  content?: string;
  mediaUrl?: string;
  mediaThumbnailUrl?: string;
  durationSeconds?: number;
}

export interface PostReaction {
  id: string;
  postId: string;
  userId: string;
  reactionType: string;
  createdAt: Date;
}

// Calendar Event types
export interface CalendarEvent {
  id: string;
  pairId: string;
  createdBy: string;
  title: string;
  description?: string;
  eventDate: Date;
  endDate?: Date;
  isAllDay: boolean;
  category?: string;
  color?: string;
  location?: string;
  reminderMinutes?: number;
  isRecurring: boolean;
  recurrenceRule?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventDTO {
  title: string;
  description?: string;
  eventDate: Date;
  endDate?: Date;
  isAllDay?: boolean;
  category?: string;
  color?: string;
  location?: string;
  reminderMinutes?: number;
  isRecurring?: boolean;
  recurrenceRule?: string;
}

// List types
export interface SharedList {
  id: string;
  pairId: string;
  createdBy: string;
  listType: 'todo' | 'shopping' | 'bucket_list' | 'custom';
  title: string;
  description?: string;
  color?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  items?: ListItem[];
}

export interface ListItem {
  id: string;
  listId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  assignedTo?: string;
  completedBy?: string;
  completedAt?: Date;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  position?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateListDTO {
  listType: 'todo' | 'shopping' | 'bucket_list' | 'custom';
  title: string;
  description?: string;
  color?: string;
}

export interface CreateListItemDTO {
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
}

// Daily Question types
export interface DailyQuestion {
  id: string;
  questionText: string;
  category: string;
  difficultyLevel: number;
  isActive: boolean;
  createdAt: Date;
}

export interface DailyQuestionSchedule {
  id: string;
  pairId: string;
  questionId: string;
  scheduledDate: Date;
  deliveredAt?: Date;
  createdAt: Date;
  question?: DailyQuestion;
  answers?: DailyQuestionAnswer[];
}

export interface DailyQuestionAnswer {
  id: string;
  scheduleId: string;
  userId: string;
  answerText: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    displayName?: string;
    profilePhotoUrl?: string;
  };
}

export interface CreateAnswerDTO {
  answerText: string;
}

// Expense types
export interface Expense {
  id: string;
  pairId: string;
  addedBy: string;
  title: string;
  amount: number;
  currency: string;
  category?: string;
  expenseDate: Date;
  paidBy?: string;
  splitType: 'equal' | 'custom' | 'percentage';
  splitRatio?: { [userId: string]: number };
  notes?: string;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExpenseDTO {
  title: string;
  amount: number;
  currency?: string;
  category?: string;
  expenseDate: Date;
  paidBy?: string;
  splitType?: 'equal' | 'custom' | 'percentage';
  splitRatio?: { [userId: string]: number };
  notes?: string;
  receiptUrl?: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  notificationType: string;
  title: string;
  body: string;
  data?: any;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

// User Settings types
export interface UserSettings {
  id: string;
  userId: string;
  notificationEnabled: boolean;
  dailyQuestionTime: string;
  eventReminders: boolean;
  newPostNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateSettingsDTO {
  notificationEnabled?: boolean;
  dailyQuestionTime?: string;
  eventReminders?: boolean;
  newPostNotifications?: boolean;
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  timezone?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
