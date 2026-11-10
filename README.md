# PERSONAL TRACKER — Centralized SaaS Management System

Modern, premium personal operating system for managing daily activities, productivity, finances, learning, fitness, travel, contacts, creative projects, clients, and events.

---

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React, JavaScript (JSX), Tailwind CSS, Lucide React, Recharts, Framer Motion
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT Authentication, bcryptjs
- **Default Currency**: INR (₹)

---

## Quick Start Guide

### 1. Start MongoDB
Ensure MongoDB is running locally on default port 27017:
```bash
mongod --dbpath backend/data/db --port 27017
```

### 2. Start the Backend API (Port 5000)
In a terminal window:
```bash
cd backend
node server.js
```
The API will be available at: `http://localhost:5000/api`

### 3. Start the Frontend (Port 3000)
In a second terminal window:
```bash
cd frontend
npm start
# or for live code editing:
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

### Quick Launch Option (Windows)
Double-click `run-app.bat` in the project root to launch both the backend and frontend in separate command windows automatically.

---

## Preloaded Demo Credentials
- **Email**: `demo@personaltracker.com`
- **Password**: `password123`

*(You can also register a brand new isolated account on the `/register` page).*

---

## 18 Modules Included
1. **Global Dashboard**: Unified metrics, today's habit checklist, priority tasks, weekly activity chart, recent finance, upcoming travel, and follow-ups.
2. **Habit Tracker**: Custom habits, 7-day completion matrix, streaks calculation.
3. **Expense Tracker**: Income/expense in ₹ INR, category breakdown charts, savings goals.
4. **Productivity Tracker**: Priority tasks with due dates, integrated Pomodoro timer (25m Focus / 5m Break).
5. **Fitness Tracker**: Workouts logger, calories, sets, reps, and daily health vitals (weight, steps, water, sleep).
6. **Study Tracker**: Course subjects, target hours, exam countdown badges, session logs.
7. **Reading Tracker**: Bookshelf shelf, page progress bars, ratings, reading sessions.
8. **Time Tracker**: Live start/stop timer, manual time entries, category distribution.
9. **Goal Tracker**: Short-term and long-term goals, milestone checklists with auto-calculated progress percentage.
10. **Travel Planner**: Trips, destinations, budgets in ₹ INR, packing checklist, travel expense tracking.
11. **Orbit Connections & Call Manager**: Personal CRM contact directory, VIP starring, manual call logger with scheduled follow-up reminders.
12. **Extracurricular & Creative Projects**: Side project showcase with skills tags, progress sliders, and portfolio badges.
13. **Graphic Design Studio**:
    - **Studio Hub**: Total invoiced, collected payments, pending receivables.
    - **Client Registry**: Directory of clients with interconnected profiles showing all associated design projects.
    - **Design Projects Tracker**: Logo design, brand identities, UI/UX, advance and remaining payments, revision notes.
14. **Programs & Events Portal**: Event scheduler, workshops, participant registration.
15. **Centralized Calendar**: Consolidated monthly agenda combining tasks, habits, trips, deadlines, events, and follow-ups.
16. **Notifications**: Automated alerts for overdue tasks, approaching trip dates, and call follow-up reminders.
17. **Reports & Analytics**: Cross-module intelligence with timeframe filters and Recharts visualizations.
18. **Settings & Data Backup**: Profile preferences, currency selector (INR ₹ default), password change, and full JSON data backup export.

