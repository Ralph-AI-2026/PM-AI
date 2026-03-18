# HROP - Property Maintenance Platform

**HROP** (Ukrainian for "Help") is a three-sided marketplace connecting tenants, landlords, and service providers for seamless property maintenance.

## Features

- **For Tenants:** Submit maintenance requests with photos, track progress, get real-time updates
- **For Landlords:** Manage multiple properties, approve requests with AI cost estimates, track all maintenance
- **For Service Providers:** Uber-style job marketplace, accept work on your terms, track earnings

## Tech Stack

- **Frontend:** React 19 + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Realtime + Storage)
- **AI:** DeepSeek API (cost estimation and job routing)
- **Deployment:** Vercel
- **PWA:** Service worker enabled for mobile app experience

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173)

## Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `supabase-schema.sql` in the Supabase SQL Editor
3. Enable Storage bucket for maintenance photos: `maintenance-photos`

## Deployment

Deploy to Vercel:
```bash
vercel --prod
```

## License

Apache-2.0
