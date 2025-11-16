-- OURS App - Initial Database Schema Migration
-- Run this migration to set up the PostgreSQL database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid VARCHAR(128) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  profile_photo_url TEXT,
  phone_number VARCHAR(20),
  paired_with UUID REFERENCES users(id) ON DELETE SET NULL,
  invite_code VARCHAR(10) UNIQUE,
  invite_code_expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_invite_code ON users(invite_code);
CREATE INDEX idx_users_paired_with ON users(paired_with);

-- 2. Pair requests table
CREATE TABLE pair_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  invite_code VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP,
  UNIQUE(requester_id, recipient_id)
);

CREATE INDEX idx_pair_requests_requester ON pair_requests(requester_id);
CREATE INDEX idx_pair_requests_recipient ON pair_requests(recipient_id);

-- 3. Shared posts table
CREATE TABLE shared_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id UUID NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_type VARCHAR(20) NOT NULL,
  content TEXT,
  media_url TEXT,
  media_thumbnail_url TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shared_posts_pair ON shared_posts(pair_id);
CREATE INDEX idx_shared_posts_author ON shared_posts(author_id);
CREATE INDEX idx_shared_posts_created ON shared_posts(created_at DESC);

-- 4. Post reactions table
CREATE TABLE post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES shared_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) DEFAULT 'like',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_reactions_post ON post_reactions(post_id);

-- 5. Calendar events table
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id UUID NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  is_all_day BOOLEAN DEFAULT false,
  category VARCHAR(50),
  color VARCHAR(7),
  location TEXT,
  reminder_minutes INTEGER,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_calendar_events_pair ON calendar_events(pair_id);
CREATE INDEX idx_calendar_events_date ON calendar_events(event_date);

-- 6. Shared lists table
CREATE TABLE shared_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id UUID NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  list_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  color VARCHAR(7),
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shared_lists_pair ON shared_lists(pair_id);
CREATE INDEX idx_shared_lists_type ON shared_lists(list_type);

-- 7. List items table
CREATE TABLE list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES shared_lists(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_at TIMESTAMP,
  due_date TIMESTAMP,
  priority VARCHAR(20),
  position INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_list_items_list ON list_items(list_id);
CREATE INDEX idx_list_items_assigned ON list_items(assigned_to);

-- 8. Daily questions table
CREATE TABLE daily_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  category VARCHAR(50),
  difficulty_level INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_daily_questions_category ON daily_questions(category);

-- 9. Daily question schedule table
CREATE TABLE daily_question_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id UUID NOT NULL,
  question_id UUID NOT NULL REFERENCES daily_questions(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pair_id, scheduled_date)
);

CREATE INDEX idx_dq_schedule_pair ON daily_question_schedule(pair_id);
CREATE INDEX idx_dq_schedule_date ON daily_question_schedule(scheduled_date);

-- 10. Daily question answers table
CREATE TABLE daily_question_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES daily_question_schedule(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(schedule_id, user_id)
);

CREATE INDEX idx_dq_answers_schedule ON daily_question_answers(schedule_id);
CREATE INDEX idx_dq_answers_user ON daily_question_answers(user_id);

-- 11. Expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id UUID NOT NULL,
  added_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  category VARCHAR(50),
  expense_date DATE NOT NULL,
  paid_by UUID REFERENCES users(id) ON DELETE SET NULL,
  split_type VARCHAR(20) DEFAULT 'equal',
  split_ratio JSONB,
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expenses_pair ON expenses(pair_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date DESC);
CREATE INDEX idx_expenses_category ON expenses(category);

-- 12. Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- 13. User settings table
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_enabled BOOLEAN DEFAULT true,
  daily_question_time TIME DEFAULT '20:00:00',
  event_reminders BOOLEAN DEFAULT true,
  new_post_notifications BOOLEAN DEFAULT true,
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shared_posts_updated_at BEFORE UPDATE ON shared_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shared_lists_updated_at BEFORE UPDATE ON shared_lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_list_items_updated_at BEFORE UPDATE ON list_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dq_answers_updated_at BEFORE UPDATE ON daily_question_answers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
