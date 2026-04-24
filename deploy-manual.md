# Manual Vercel Deployment Steps

Since automated browser login is blocked, here's how to deploy manually:

## Option 1: Via Vercel CLI (Recommended)
1. Open PowerShell/Terminal in this directory
2. Run: `npx vercel login`
3. Follow the browser login (you're already logged into Vercel)
4. Once logged in, run: `npx vercel --prod`
5. Add environment variables when prompted

## Option 2: Via Vercel Dashboard (Easier)
1. Go to: https://vercel.com/new
2. Click "Import" next to GitHub
3. Search for: `Ralph-AI-2026/PM-AI`
4. Click "Import"
5. Add these environment variables:
   - `VITE_SUPABASE_URL` = `https://uyazjsoystozhetysdtc.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5YXpqc295c3RvemhldHlzZHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMDQzNTUsImV4cCI6MjA5MjU4MDM1NX0.79ERzmL7k4G3WmcLRNlaz7NIsowoy-iZTRFPL7A9R-8`
   - `GEMINI_API_KEY` = `AIzaSyBgbsWfZu2sveUEFB8zAXa0PjfAhNdwHjs`
6. Click "Deploy"

## What I've Completed:
✓ Created all 9 database tables in Supabase
✓ Configured environment variables in .env
✓ Pushed code to GitHub (Ralph-AI-2026/PM-AI)
✓ Everything is ready for deployment

The only step left is the Vercel deployment itself, which requires your browser session.
