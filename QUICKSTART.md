# OURS App - Quick Start (30 seconds)

## First Time Setup

### 1. Install Dependencies (one-time only)
```bash
cd /home/user/Claude/backend
npm install

cd /home/user/Claude/frontend
npm install
```

### 2. Set Up Database (one-time only)
```bash
# Create database
createdb ours_app

# Run migrations
cd /home/user/Claude/backend
psql -U postgres -d ours_app -f src/database/migrations/001_initial_schema.sql
psql -U postgres -d ours_app -f src/database/seeds/daily_questions.sql
```

### 3. Configure Environment Variables (one-time only)
```bash
# Backend
cd /home/user/Claude/backend
cp .env.example .env
# Edit .env with your Firebase & PostgreSQL credentials

# Frontend
cd /home/user/Claude/frontend
cp .env.example .env
# Edit .env with your Firebase web config
```

---

## Running the App (every time)

### Option 1: Using Scripts (Easiest!)

**Terminal 1 - Backend:**
```bash
cd /home/user/Claude
./start-backend.sh
```

**Terminal 2 - Frontend:**
```bash
cd /home/user/Claude
./start-frontend.sh
```

### Option 2: Manual Commands

**Terminal 1 - Backend:**
```bash
cd /home/user/Claude/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd /home/user/Claude/frontend
npm start
```

Then press `w` to open in web browser!

---

## Testing the App

1. Open the frontend (press `w` in the Expo terminal)
2. Click "Sign up"
3. Enter name, email, password
4. Generate an invite code (or skip pairing)
5. Go to the Hub tab
6. Create your first post!

---

## Common Commands

### Stop the servers
Press `Ctrl + C` in each terminal

### Clear cache (if something breaks)
```bash
# Frontend
cd /home/user/Claude/frontend
expo start -c

# Backend
cd /home/user/Claude/backend
rm -rf node_modules
npm install
```

### View database data
```bash
psql -U postgres -d ours_app
\dt                    # List tables
SELECT * FROM users;   # View users
\q                     # Quit
```

---

## Need Detailed Instructions?

See **GETTING_STARTED.md** for the complete step-by-step guide!
