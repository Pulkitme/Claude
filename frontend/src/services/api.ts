/**
 * API Service
 * Handles all API requests to the backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { auth } from '../config/firebase';
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  SharedPost,
  CreatePostData,
  CalendarEvent,
  SharedList,
  ListItem,
  DailyQuestion,
  Expense,
  PairingStatus,
  UserSettings,
} from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

/**
 * Create axios instance with default configuration
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_URL,
    timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000'),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  client.interceptors.request.use(
    async (config) => {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiResponse>) => {
      const message = error.response?.data?.error || error.message || 'An error occurred';
      return Promise.reject(new Error(message));
    }
  );

  return client;
};

const api = createApiClient();

// ===================
// Authentication API
// ===================

export const authApi = {
  register: async (firebaseUid: string, email: string, displayName?: string) => {
    const response = await api.post<ApiResponse<{ user: User }>>('/auth/register', {
      firebaseUid,
      email,
      displayName,
    });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete<ApiResponse>('/auth/account');
    return response.data;
  },
};

// ===================
// User API
// ===================

export const userApi = {
  getProfile: async () => {
    const response = await api.get<ApiResponse<User>>('/users/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await api.put<ApiResponse<User>>('/users/profile', data);
    return response.data;
  },

  getSettings: async () => {
    const response = await api.get<ApiResponse<UserSettings>>('/users/settings');
    return response.data;
  },

  updateSettings: async (settings: Partial<UserSettings>) => {
    const response = await api.put<ApiResponse<UserSettings>>('/users/settings', settings);
    return response.data;
  },
};

// ===================
// Pairing API
// ===================

export const pairingApi = {
  generateCode: async () => {
    const response = await api.post<ApiResponse<{ inviteCode: string; expiresAt: string }>>(
      '/pairing/generate-code'
    );
    return response.data;
  },

  acceptCode: async (inviteCode: string) => {
    const response = await api.post<ApiResponse>('/pairing/accept-code', { inviteCode });
    return response.data;
  },

  getStatus: async () => {
    const response = await api.get<ApiResponse<PairingStatus>>('/pairing/status');
    return response.data;
  },

  unpair: async () => {
    const response = await api.delete<ApiResponse>('/pairing/unpair');
    return response.data;
  },
};

// ===================
// Posts API (Shared Hub)
// ===================

export const postsApi = {
  getPosts: async (page: number = 1, limit: number = 20) => {
    const response = await api.get<PaginatedResponse<SharedPost>>('/posts', {
      params: { page, limit },
    });
    return response.data;
  },

  getPost: async (id: string) => {
    const response = await api.get<ApiResponse<SharedPost>>(`/posts/${id}`);
    return response.data;
  },

  createPost: async (data: CreatePostData) => {
    const response = await api.post<ApiResponse<SharedPost>>('/posts', data);
    return response.data;
  },

  deletePost: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/posts/${id}`);
    return response.data;
  },

  addReaction: async (postId: string, reactionType: string = 'like') => {
    const response = await api.post<ApiResponse>(`/posts/${postId}/react`, { reactionType });
    return response.data;
  },

  removeReaction: async (postId: string) => {
    const response = await api.delete<ApiResponse>(`/posts/${postId}/react`);
    return response.data;
  },
};

// ===================
// Calendar API
// ===================

export const calendarApi = {
  getEvents: async (startDate?: string, endDate?: string) => {
    const response = await api.get<ApiResponse<CalendarEvent[]>>('/calendar/events', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  createEvent: async (data: Partial<CalendarEvent>) => {
    const response = await api.post<ApiResponse<CalendarEvent>>('/calendar/events', data);
    return response.data;
  },

  updateEvent: async (id: string, data: Partial<CalendarEvent>) => {
    const response = await api.put<ApiResponse<CalendarEvent>>(`/calendar/events/${id}`, data);
    return response.data;
  },

  deleteEvent: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/calendar/events/${id}`);
    return response.data;
  },
};

// ===================
// Lists API
// ===================

export const listsApi = {
  getLists: async (listType?: string, includeArchived?: boolean) => {
    const response = await api.get<ApiResponse<SharedList[]>>('/lists', {
      params: { listType, includeArchived },
    });
    return response.data;
  },

  createList: async (data: Partial<SharedList>) => {
    const response = await api.post<ApiResponse<SharedList>>('/lists', data);
    return response.data;
  },

  getListItems: async (listId: string) => {
    const response = await api.get<ApiResponse<ListItem[]>>(`/lists/${listId}/items`);
    return response.data;
  },

  addListItem: async (listId: string, data: Partial<ListItem>) => {
    const response = await api.post<ApiResponse<ListItem>>(`/lists/${listId}/items`, data);
    return response.data;
  },

  updateListItem: async (itemId: string, data: Partial<ListItem>) => {
    const response = await api.put<ApiResponse<ListItem>>(`/lists/items/${itemId}`, data);
    return response.data;
  },

  deleteListItem: async (itemId: string) => {
    const response = await api.delete<ApiResponse>(`/lists/items/${itemId}`);
    return response.data;
  },
};

// ===================
// Questions API
// ===================

export const questionsApi = {
  getTodayQuestion: async () => {
    const response = await api.get<ApiResponse<DailyQuestion>>('/questions/today');
    return response.data;
  },

  submitAnswer: async (scheduleId: string, answerText: string) => {
    const response = await api.post<ApiResponse>(`/questions/${scheduleId}/answer`, {
      answerText,
    });
    return response.data;
  },

  getHistory: async (limit: number = 30, offset: number = 0) => {
    const response = await api.get<ApiResponse<DailyQuestion[]>>('/questions/history', {
      params: { limit, offset },
    });
    return response.data;
  },
};

// ===================
// Expenses API
// ===================

export const expensesApi = {
  getExpenses: async (page: number = 1, limit: number = 20, filters?: any) => {
    const response = await api.get<PaginatedResponse<Expense>>('/expenses', {
      params: { page, limit, ...filters },
    });
    return response.data;
  },

  createExpense: async (data: Partial<Expense>) => {
    const response = await api.post<ApiResponse<Expense>>('/expenses', data);
    return response.data;
  },

  updateExpense: async (id: string, data: Partial<Expense>) => {
    const response = await api.put<ApiResponse<Expense>>(`/expenses/${id}`, data);
    return response.data;
  },

  deleteExpense: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/expenses/${id}`);
    return response.data;
  },

  getSummary: async (month?: number, year?: number) => {
    const response = await api.get<ApiResponse<any>>('/expenses/summary', {
      params: { month, year },
    });
    return response.data;
  },
};

export default api;
