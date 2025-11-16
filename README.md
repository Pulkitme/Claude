# OURS - Relationship Super-App

**OURS** is a full-stack mobile application designed to help couples manage their relationship with shared features including a timeline, calendar, lists, daily questions, and expense tracking.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Development Roadmap](#development-roadmap)

---

## Overview

OURS is an all-in-one relationship management platform that allows couples to:
- Share photos, videos, text posts, and voice messages in a private timeline
- Manage shared calendars with events and reminders
- Create and manage shared lists (To-Do, Shopping, Bucket List)
- Answer daily relationship questions together
- Track shared expenses and view spending summaries

The app uses an invite-based pairing system to connect two users securely.

---

## Tech Stack

### Frontend
- **React Native** with **Expo** (v50)
- **TypeScript** for type safety
- **React Navigation** for routing
- **React Native Paper** for UI components
- **Firebase SDK** for authentication and real-time features
- **Axios** for API requests

### Backend
- **Node.js** with **Express**
- **TypeScript**
- **PostgreSQL** for relational data
- **Firebase Admin SDK** for authentication verification
- **Firebase Firestore** for real-time features
- **JWT** for session management

### Database & Storage
- **PostgreSQL** - User data, posts, events, lists, expenses
- **Firebase Firestore** - Real-time sync, presence, chat
- **Firebase Storage** - Media files (photos, videos)
- **AWS S3** (alternative for media storage)

### Additional Services
- **Firebase Cloud Messaging** - Push notifications
- **Stripe** - Payment processing (for future premium features)

---

## Project Structure

```
.
├── backend/                    # Node.js/Express backend
│   ├── src/
│   │   ├── config/            # Database, Firebase configs
│   │   ├── controllers/       # Request handlers
│   │   ├── database/          # Migrations and seeds
│   │   ├── middleware/        # Auth, error handling
│   │   ├── models/            # Data models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── types/             # TypeScript definitions
│   │   ├── utils/             # Helper functions
│   │   └── index.ts           # Server entry point
│   ├── .env.example           # Environment variables template
│   ├── package.json
│   ├── tsconfig.json
│   └── DATABASE_SCHEMA.md     # Database schema documentation
│
├── frontend/                  # React Native/Expo frontend
│   ├── src/
│   │   ├── assets/            # Images, fonts
│   │   ├── components/        # Reusable components
│   │   ├── config/            # App configuration, theme
│   │   ├── contexts/          # React contexts (Auth)
│   │   ├── navigation/        # Navigation setup
│   │   ├── screens/           # Screen components
│   │   ├── services/          # API service layer
│   │   ├── types/             # TypeScript definitions
│   │   └── utils/             # Helper functions
│   ├── App.tsx                # App entry point
│   ├── app.json               # Expo configuration
│   ├── .env.example           # Environment variables template
│   ├── package.json
│   └── tsconfig.json
│
└── README.md                  # This file
```

---

## Features

### ✅ Implemented (Phase 1)

#### 1. **Authentication & Pairing**
- Firebase email/password authentication
- User registration with backend sync
- Invite code generation and acceptance
- Secure pairing between two users

#### 2. **Shared Hub** (Complete Reference Feature)
- Create and view shared posts (text, photos, videos, voice)
- React to posts with likes/hearts
- Delete your own posts
- Real-time timeline updates
- User avatars and timestamps

#### 3. **Navigation**
- Bottom tab navigation
- Auth flow (Login, Register, Pairing)
- Main app tabs (Hub, Calendar, Lists, Questions, More)

### 🚧 Backend Ready, Frontend Pending

#### 4. **Shared Calendar**
- API endpoints for creating/updating/deleting events
- Support for recurring events
- Category and color coding
- Reminder notifications

#### 5. **Shared Lists**
- API for To-Do, Shopping, and Bucket Lists
- Add/edit/delete items
- Assign items to partner
- Mark items as complete
- Custom list types

#### 6. **Daily Questions**
- 50+ relationship questions seeded
- Daily question delivery
- Answer submission
- View partner's answer after answering
- Question history archive

#### 7. **Money Manager**
- Add shared expenses
- Categorize spending
- Custom split ratios
- Monthly summaries
- Spending charts by category

---

## Setup Instructions

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **Firebase Project** (for authentication and real-time features)
- **Expo CLI** (install globally: `npm install -g expo-cli`)
- **iOS Simulator** or **Android Emulator** (or physical device with Expo Go app)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Claude
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env and fill in your configuration
# (See Environment Variables section below)

# Build TypeScript
npm run build
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env and fill in your Firebase config
```

### 4. Firebase Setup

1. Create a new Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Email/Password** authentication
3. Create a **Firestore Database** (start in test mode, then secure with rules)
4. Enable **Firebase Storage**
5. Download **Service Account Key** for backend (Project Settings → Service Accounts)
6. Get **Web App Config** for frontend (Project Settings → Your apps → Web)

---

## Environment Variables

### Backend (.env)

```bash
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ours_app
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Firebase Admin (from service account JSON)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="your_private_key"
FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
FIREBASE_STORAGE_BUCKET=your_project.appspot.com

# AWS S3 (optional, alternative to Firebase Storage)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=ours-app-media

# Stripe (for future use)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key

# CORS
CORS_ORIGIN=http://localhost:19006,exp://localhost:19000

# Configuration
INVITE_CODE_LENGTH=8
INVITE_CODE_EXPIRY_HOURS=72
```

### Frontend (.env)

```bash
# API
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
EXPO_PUBLIC_API_TIMEOUT=30000

# Firebase (from web app config)
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe (for future use)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key

# App
EXPO_PUBLIC_APP_NAME=OURS
EXPO_PUBLIC_ENVIRONMENT=development
```

---

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ours_app;

# Exit
\q
```

### 2. Run Migrations

```bash
cd backend

# Run the initial schema migration
psql -U postgres -d ours_app -f src/database/migrations/001_initial_schema.sql

# Seed daily questions
psql -U postgres -d ours_app -f src/database/seeds/daily_questions.sql
```

### 3. Verify Tables

```bash
psql -U postgres -d ours_app

# List tables
\dt

# Should see: users, pair_requests, shared_posts, post_reactions,
# calendar_events, shared_lists, list_items, daily_questions,
# daily_question_schedule, daily_question_answers, expenses,
# notifications, user_settings
```

---

## Running the Application

### Start Backend Server

```bash
cd backend

# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Backend will run at `http://localhost:3000`

API health check: `http://localhost:3000/health`

### Start Frontend App

```bash
cd frontend

# Start Expo development server
npm start

# Or run on specific platform
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Web browser
```

### Testing the App

1. **Register** a new account (creates user in Firebase + backend)
2. **Generate Invite Code** on the Pairing screen
3. **Register** a second account (use different email)
4. **Accept Invite Code** to pair the two accounts
5. **Navigate to Hub** tab and create your first post
6. Test reactions, deleting posts, and refreshing

---

## API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <firebase_id_token>
```

### Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `GET /auth/me` - Get current user
- `DELETE /auth/account` - Delete account

#### Users
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update profile
- `GET /users/settings` - Get user settings
- `PUT /users/settings` - Update settings

#### Pairing
- `POST /pairing/generate-code` - Generate invite code
- `POST /pairing/accept-code` - Accept invite code
- `GET /pairing/status` - Get pairing status
- `DELETE /pairing/unpair` - Unpair from partner

#### Posts (Shared Hub)
- `GET /posts` - Get all posts (paginated)
- `POST /posts` - Create new post
- `GET /posts/:id` - Get specific post
- `DELETE /posts/:id` - Delete post
- `POST /posts/:id/react` - Add/update reaction
- `DELETE /posts/:id/react` - Remove reaction

#### Calendar
- `GET /calendar/events` - Get events (with date range filter)
- `POST /calendar/events` - Create event
- `PUT /calendar/events/:id` - Update event
- `DELETE /calendar/events/:id` - Delete event

#### Lists
- `GET /lists` - Get all lists
- `POST /lists` - Create list
- `GET /lists/:id/items` - Get list items
- `POST /lists/:id/items` - Add item to list
- `PUT /lists/items/:itemId` - Update list item
- `DELETE /lists/items/:itemId` - Delete list item

#### Questions
- `GET /questions/today` - Get today's question
- `POST /questions/:scheduleId/answer` - Submit answer
- `GET /questions/history` - Get past questions

#### Expenses
- `GET /expenses` - Get expenses (paginated, with filters)
- `POST /expenses` - Create expense
- `PUT /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense
- `GET /expenses/summary` - Get spending summary

See `backend/src/routes/` for detailed request/response schemas.

---

## Development Roadmap

### Phase 1 ✅ (Current)
- [x] Project scaffolding
- [x] Database schema
- [x] Authentication system
- [x] User pairing
- [x] Shared Hub (complete reference feature)
- [x] Backend APIs for all features
- [x] Basic navigation structure

### Phase 2 🚧 (Next Steps)
- [ ] Complete frontend for Calendar
- [ ] Complete frontend for Lists
- [ ] Complete frontend for Daily Questions
- [ ] Complete frontend for Money Manager
- [ ] Image/video upload functionality
- [ ] Voice recording
- [ ] Push notifications

### Phase 3 📋 (Future)
- [ ] Real-time sync with Firestore
- [ ] Offline-first architecture
- [ ] Gottman conflict resolution tools
- [ ] Intimacy tracker
- [ ] Watch-together feature
- [ ] Gift ordering integration
- [ ] Relationship health dashboard
- [ ] Premium subscription (Stripe)
- [ ] Dark mode
- [ ] Accessibility improvements

---

## Key Design Decisions

### Security
- Firebase handles authentication
- JWT tokens for API requests
- All user data requires authentication
- Pair-specific data isolated by `pair_id`
- Input validation on all endpoints

### Data Privacy
- Each pair's data is completely isolated
- Media URLs use signed URLs (when using Firebase Storage)
- No data sharing between pairs
- Users must be explicitly paired

### Scalability
- Pagination on all list endpoints
- Database indexes on frequently queried fields
- Connection pooling for PostgreSQL
- Stateless API design

### User Experience
- Offline-first design (Phase 2)
- Real-time updates via Firestore
- Smooth animations and transitions
- Intuitive tab-based navigation

---

## Contributing

This is a personal project, but suggestions and feedback are welcome!

---

## License

Private - All rights reserved

---

## Support

For issues or questions, please create an issue in the repository.

---

## Acknowledgments

Built with ❤️ for couples who want to keep their relationship organized and connected.
