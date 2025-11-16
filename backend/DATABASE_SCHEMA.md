# OURS App - Database Schema

## PostgreSQL Tables

### 1. users
Stores user account information
```sql
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
```

### 2. pair_requests
Tracks pairing requests between users
```sql
CREATE TABLE pair_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected, expired
  invite_code VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP,
  UNIQUE(requester_id, recipient_id)
);

CREATE INDEX idx_pair_requests_requester ON pair_requests(requester_id);
CREATE INDEX idx_pair_requests_recipient ON pair_requests(recipient_id);
```

### 3. shared_posts
Shared timeline posts (photos, videos, text, voice)
```sql
CREATE TABLE shared_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id UUID NOT NULL, -- References the pair relationship
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_type VARCHAR(20) NOT NULL, -- text, photo, video, voice
  content TEXT, -- Text content or caption
  media_url TEXT, -- S3/Firebase Storage URL
  media_thumbnail_url TEXT, -- Thumbnail for videos
  duration_seconds INTEGER, -- For voice/video
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shared_posts_pair ON shared_posts(pair_id);
CREATE INDEX idx_shared_posts_author ON shared_posts(author_id);
CREATE INDEX idx_shared_posts_created ON shared_posts(created_at DESC);
```

### 4. post_reactions
Reactions/likes on shared posts
```sql
CREATE TABLE post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES shared_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) DEFAULT 'like', -- like, love, laugh, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_reactions_post ON post_reactions(post_id);
```

### 5. calendar_events
Shared calendar events
```sql
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id UUID NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  is_all_day BOOLEAN DEFAULT false,
  category VARCHAR(50), -- date, appointment, reminder, anniversary, etc.
  color VARCHAR(7), -- Hex color code
  location TEXT,
  reminder_minutes INTEGER, -- Minutes before event to remind
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT, -- RRULE format for recurring events
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_calendar_events_pair ON calendar_events(pair_id);
CREATE INDEX idx_calendar_events_date ON calendar_events(event_date);
```

### 6. shared_lists
Container for different types of lists
```sql
CREATE TABLE shared_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id UUID NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  list_type VARCHAR(50) NOT NULL, -- todo, shopping, bucket_list, custom
  title VARCHAR(200) NOT NULL,
  description TEXT,
  color VARCHAR(7),
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shared_lists_pair ON shared_lists(pair_id);
CREATE INDEX idx_shared_lists_type ON shared_lists(list_type);
```

### 7. list_items
Items within shared lists
```sql
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
  priority VARCHAR(20), -- low, medium, high
  position INTEGER, -- For custom ordering
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_list_items_list ON list_items(list_id);
CREATE INDEX idx_list_items_assigned ON list_items(assigned_to);
```

### 8. daily_questions
Database of daily relationship questions
```sql
CREATE TABLE daily_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  category VARCHAR(50), -- communication, intimacy, future, past, fun, deep, etc.
  difficulty_level INTEGER DEFAULT 1, -- 1-5 scale
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_daily_questions_category ON daily_questions(category);
```

### 9. daily_question_schedule
Tracks which questions are delivered to which pairs
```sql
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
```

### 10. daily_question_answers
User answers to daily questions
```sql
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
```

### 11. expenses
Shared expense tracking
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id UUID NOT NULL,
  added_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  category VARCHAR(50), -- food, rent, entertainment, transportation, utilities, etc.
  expense_date DATE NOT NULL,
  paid_by UUID REFERENCES users(id) ON DELETE SET NULL,
  split_type VARCHAR(20) DEFAULT 'equal', -- equal, custom, percentage
  split_ratio JSONB, -- {"user1_id": 0.5, "user2_id": 0.5}
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expenses_pair ON expenses(pair_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date DESC);
CREATE INDEX idx_expenses_category ON expenses(category);
```

### 12. notifications
App notifications (supplement to FCM)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL, -- event_reminder, new_post, daily_question, etc.
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  data JSONB, -- Additional data payload
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

### 13. user_settings
User-specific settings and preferences
```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_enabled BOOLEAN DEFAULT true,
  daily_question_time TIME DEFAULT '20:00:00',
  event_reminders BOOLEAN DEFAULT true,
  new_post_notifications BOOLEAN DEFAULT true,
  theme VARCHAR(20) DEFAULT 'light', -- light, dark, system
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Firebase Firestore Collections

### real_time_sync
For real-time updates and presence
```
/pairs/{pairId}/
  - lastActivity: timestamp
  - activeUsers: array of user IDs currently online

/pairs/{pairId}/typing/
  - {userId}: boolean (is user typing)

/pairs/{pairId}/presence/
  - {userId}: {
      online: boolean,
      lastSeen: timestamp
    }
```

### chat_messages (if implementing real-time chat)
```
/pairs/{pairId}/messages/{messageId}
  - senderId: string
  - content: string
  - timestamp: timestamp
  - read: boolean
  - type: 'text' | 'emoji' | 'sticker'
```

## Notes

1. **pair_id**: For most shared features, we use a computed pair_id which is a deterministic combination of two user IDs (e.g., sorted UUID concatenation or hash). This ensures consistency.

2. **Encryption**: Sensitive text fields (e.g., post content, answers) should be encrypted at the application layer before storage.

3. **Soft Deletes**: For critical data, consider adding `deleted_at` timestamp instead of hard deletes.

4. **Indexes**: Additional composite indexes may be needed based on query patterns.

5. **Triggers**: Consider PostgreSQL triggers for:
   - Updating `updated_at` timestamps
   - Cascading pair deletion operations
   - Sending notifications on certain events
