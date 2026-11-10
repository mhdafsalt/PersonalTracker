# Deployment Guide — GitHub & Vercel

This repository contains a full-stack SaaS architecture with a Next.js App Router frontend and an Express.js / MongoDB backend.

---

## 1. Push to GitHub

The local Git repository is already initialized and your initial commit is created on `main`.

### Step 1: Create a Repository on GitHub
1. Open your browser and navigate to **[github.com/new](https://github.com/new)**.
2. Enter repository name: `personal-tracker` (or your preferred name).
3. Choose **Public** or **Private**.
4. Leave "Add a README", ".gitignore", and "License" unchecked (we already have them).
5. Click **Create repository**.

### Step 2: Link and Push
In your terminal (in `C:\afsall\Antigravity\Personal_Tracker`):
```bash
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/personal-tracker.git
git branch -M main
git push -u origin main
```
*(Replace `<YOUR_GITHUB_USERNAME>` with your GitHub handle).*

---

## 2. Deploy Frontend to Vercel

Vercel natively optimizes Next.js App Router applications.

### Step 1: Import on Vercel
1. Go to **[vercel.com/new](https://vercel.com/new)**.
2. Select and import your GitHub repository: `personal-tracker`.

### Step 2: Configure Root Directory
Under **Project Settings**:
1. Click **Edit** next to **Root Directory**.
2. Select `frontend`.
3. Framework Preset will automatically detect **Next.js**.

### Step 3: Add Environment Variables
Under **Environment Variables**:
| Key | Value | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-api-url.onrender.com/api` | The live URL of your Express API |

*(For testing before deploying the backend, you can temporarily set `NEXT_PUBLIC_API_URL=http://localhost:5000/api` if testing locally).*

### Step 4: Click Deploy
Vercel will build and deploy your Next.js application with a production URL (e.g. `https://personal-tracker-xxx.vercel.app`).

---

## 3. Deploy Backend (Express + MongoDB)

Since Vercel is designed for frontend & serverless, the Express backend and MongoDB should be hosted on a persistent Node.js host.

### Step 1: MongoDB Database (MongoDB Atlas — Free)
1. Go to **[mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)** and create a free M0 cluster.
2. Under **Database Access**, create a database user and password.
3. Under **Network Access**, add IP `0.0.0.0/0` (allow from anywhere).
4. Click **Connect** -> **Drivers** and copy your connection string:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/personal_tracker?retryWrites=true&w=majority`

### Step 2: Deploy Backend to Render (or Railway)
1. Go to **[render.com](https://render.com)** -> Click **New +** -> **Web Service**.
2. Connect your `personal-tracker` GitHub repository.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add Environment Variables:
   - `MONGODB_URI`: *Your MongoDB Atlas connection string from Step 1*
   - `JWT_SECRET`: *Any secure random string*
   - `NODE_ENV`: `production`
5. Click **Create Web Service**.
6. Render will assign you a public URL (e.g. `https://personal-tracker-api.onrender.com`).

### Step 3: Connect Frontend to Backend
Go back to your **Vercel** project settings -> **Environment Variables** -> update:
`NEXT_PUBLIC_API_URL` = `https://personal-tracker-api.onrender.com/api`
Click **Redeploy**.

Your full-stack application is now globally accessible!

