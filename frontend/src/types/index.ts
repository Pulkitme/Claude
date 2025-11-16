/**
 * TypeScript Type Definitions for Frontend
 */

// User types
export interface User {
  id: string;
  firebaseUid: string;
  email: string;
  displayName?: string;
  profilePhotoUrl?: string;
  phoneNumber?: string;
  isPaired: boolean;
  partner?: Partner | null;
  createdAt: string;
}

export interface Partner {
  id: string;
  displayName?: string;
  profilePhotoUrl?: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName?: string;
}

// Pairing types
export interface PairingStatus {
  isPaired: boolean;
  inviteCode?: string;
  inviteCodeExpiresAt?: string;
  partner?: Partner | null;
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
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    displayName?: string;
    profilePhotoUrl?: string;
  };
  reactions: PostReaction[];
}

export interface PostReaction {
  id: string;
  userId: string;
  reactionType: string;
  createdAt: string;
}

export interface CreatePostData {
  postType: 'text' | 'photo' | 'video' | 'voice';
  content?: string;
  mediaUrl?: string;
  mediaThumbnailUrl?: string;
  durationSeconds?: number;
}

// Calendar Event types
export interface CalendarEvent {
  id: string;
  pairId: string;
  createdBy: string;
  title: string;
  description?: string;
  eventDate: string;
  endDate?: string;
  isAllDay: boolean;
  category?: string;
  color?: string;
  location?: string;
  reminderMinutes?: number;
  isRecurring: boolean;
  recurrenceRule?: string;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
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
  completedAt?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  position?: number;
  createdAt: string;
  updatedAt: string;
}

// Daily Question types
export interface DailyQuestion {
  scheduleId: string;
  questionId: string;
  questionText: string;
  category: string;
  difficultyLevel: number;
  scheduledDate: string;
  userAnswer?: QuestionAnswer;
  partnerAnswer?: QuestionAnswer;
}

export interface QuestionAnswer {
  id: string;
  userId: string;
  answerText: string;
  createdAt: string;
  user?: {
    displayName?: string;
    profilePhotoUrl?: string;
  };
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
  expenseDate: string;
  paidBy?: string;
  splitType: 'equal' | 'custom' | 'percentage';
  splitRatio?: { [userId: string]: number };
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// User Settings types
export interface UserSettings {
  notificationEnabled: boolean;
  dailyQuestionTime: string;
  eventReminders: boolean;
  newPostNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
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

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Pairing: undefined;
};

export type MainTabParamList = {
  Hub: undefined;
  Calendar: undefined;
  Lists: undefined;
  Questions: undefined;
  More: undefined;
};
