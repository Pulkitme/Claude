# OURS App - Quick Start Guide

This guide will walk you through setting up and running the OURS app from scratch.

## Prerequisites (Install These First)

### 1. Node.js
Download and install Node.js (v18 or higher) from: https://nodejs.org/

Check if installed:
```bash
node --version
npm --version
```

### 2. PostgreSQL
Download and install PostgreSQL from: https://www.postgresql.org/download/

For Mac (easiest way):
```bash
brew install postgresql@14
brew services start postgresql@14
```

For Windows: Download installer from PostgreSQL website

Check if installed:
```bash
psql --version
```

### 3. Expo CLI (for React Native)
```bash
npm install -g expo-cli
```

### 4. Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Follow the setup wizard
4. We'll configure it in Step 2 below

---

## Step 1: Install Dependencies

Open your terminal and navigate to the project:

```bash
cd /home/user/Claude
```

### Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

---

## Step 2: Set Up Firebase

### A. Enable Authentication
1. Go to https://console.firebase.google.com
2. Select your project
3. Click "Authentication" in the left menu
4. Click "Get started"
5. Click "Email/Password" and enable it
6. Click "Save"

### B. Create Firestore Database
1. Click "Firestore Database" in the left menu
2. Click "Create database"
3. Choose "Start in test mode"
4. Select a location (closest to you)
5. Click "Enable"

### C. Enable Storage
1. Click "Storage" in the left menu
2. Click "Get started"
3. Choose "Start in test mode"
4. Click "Done"

### D. Get Firebase Config for Frontend
1. Click the gear icon ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps"
4. Click the web icon `</>`
5. Register app with nickname "OURS Web"
6. Copy the firebaseConfig object - you'll need this!

It looks like this:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};
```

### E. Get Service Account for Backend
1. Still in "Project settings"
2. Click "Service accounts" tab
3. Click "Generate new private key"
4. Click "Generate key"
5. A JSON file will download - save it somewhere safe!

---

## Step 3: Set Up PostgreSQL Database

### Create the Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Type your postgres password if prompted

# Inside psql, run:
CREATE DATABASE ours_app;

# Exit psql
\q
```

### Run Database Migrations
```bash
# Navigate to backend folder
cd /home/user/Claude/backend

# Run the schema migration
psql -U postgres -d ours_app -f src/database/migrations/001_initial_schema.sql

# Seed the daily questions
psql -U postgres -d ours_app -f src/database/seeds/daily_questions.sql
```

You should see a bunch of CREATE TABLE statements execute successfully.

---

## Step 4: Configure Environment Variables

### Backend Configuration

```bash
cd /home/user/Claude/backend

# Copy the example file
cp .env.example .env

# Edit the .env file
nano .env
# (or use any text editor you prefer)
```

Update these values in `backend/.env`:

```bash
# Server - Leave as is
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database - Update password if needed
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ours_app
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE
DB_SSL=false

# JWT - Change this to any random string
JWT_SECRET=my-super-secret-key-change-me-in-production
JWT_EXPIRES_IN=7d

# Firebase Admin - From the JSON file you downloaded
# Open the downloaded JSON file and copy these values:
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# For Firebase Storage
USE_FIREBASE_STORAGE=true

# CORS - Leave as is for development
CORS_ORIGIN=http://localhost:19006,exp://localhost:19000

# Leave the rest as default
```

**Important:** For `FIREBASE_PRIVATE_KEY`, copy the entire private_key value from your JSON file, including the `\n` characters.

### Frontend Configuration

```bash
cd /home/user/Claude/frontend

# Copy the example file
cp .env.example .env

# Edit the .env file
nano .env
```

Update these values in `frontend/.env` (from the firebaseConfig you copied earlier):

```bash
# API - Leave as is for local development
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
EXPO_PUBLIC_API_TIMEOUT=30000

# Firebase - Copy from your Firebase web config
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Leave the rest as default
EXPO_PUBLIC_APP_NAME=OURS
EXPO_PUBLIC_ENVIRONMENT=development
```

---

## Step 5: Run the Application

### Terminal 1: Start Backend Server

```bash
cd /home/user/Claude/backend
npm run dev
```

You should see:
```
=================================
🚀 OURS API Server Running
📍 Port: 3000
🌍 Environment: development
📦 API Version: v1
🔗 URL: http://localhost:3000/api/v1
=================================
```

**Leave this terminal running!**

### Terminal 2: Start Frontend App

Open a NEW terminal window/tab:

```bash
cd /home/user/Claude/frontend
npm start
```

You should see the Expo DevTools with a QR code.

Press:
- `w` - to open in web browser (easiest for testing)
- `a` - to open in Android emulator (if you have it)
- `i` - to open in iOS simulator (Mac only)

**Recommended for first time:** Press `w` to open in your web browser.

---

## Step 6: Test the App

1. **Register a new account:**
   - Enter your name, email, and password
   - Click "Sign Up"

2. **Generate an invite code:**
   - You'll be on the Pairing screen
   - Click "Generate Invite Code"
   - Copy the code shown

3. **Test pairing (optional):**
   - Open the app in another browser/incognito window
   - Register with a different email
   - Click "Enter Code" tab
   - Paste the invite code
   - Click "Pair with Partner"

4. **Use the Shared Hub:**
   - Once paired (or skip pairing for testing)
   - Click the "Hub" tab at the bottom
   - Click the + button to create a post
   - Type something and click "Post"
   - See your post appear in the timeline!
   - Click the heart icon to react

---

## Common Issues & Solutions

### "Cannot connect to database"
- Make sure PostgreSQL is running: `brew services start postgresql@14` (Mac)
- Check your DB_PASSWORD in backend/.env

### "Firebase error" on frontend
- Make sure you copied all Firebase config values correctly
- Check that Email/Password auth is enabled in Firebase Console

### "Cannot connect to backend"
- Make sure backend is running on port 3000
- Check the backend terminal for errors
- Verify EXPO_PUBLIC_API_URL in frontend/.env is `http://localhost:3000/api/v1`

### "Port 3000 already in use"
- Something else is using port 3000
- Kill it: `lsof -ti:3000 | xargs kill -9`
- Or change PORT in backend/.env

### Expo not starting
- Make sure you installed expo-cli: `npm install -g expo-cli`
- Clear cache: `expo start -c`

---

## Stopping the App

### Stop Backend
In the backend terminal, press: `Ctrl + C`

### Stop Frontend
In the frontend terminal, press: `Ctrl + C`

---

## Next Time You Run the App

You only need to do the setup once! Next time:

```bash
# Terminal 1
cd /home/user/Claude/backend
npm run dev

# Terminal 2 (new terminal)
cd /home/user/Claude/frontend
npm start
```

---

## Need Help?

If you get stuck:
1. Check the error message carefully
2. Make sure all prerequisites are installed
3. Verify your .env files have the correct values
4. Make sure both backend and frontend are running
5. Try restarting both servers

Happy coding! 🎉
