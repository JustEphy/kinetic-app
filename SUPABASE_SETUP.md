# KINETIC - Supabase Setup Guide

This guide will help you configure Supabase as the backend for KINETIC.

## Prerequisites

1. A Supabase account (free tier works fine)
2. Node.js 18+ installed
3. The KINETIC app repository cloned

## Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in:
   - **Name**: `kinetic` (or your preferred name)
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose the closest region to your users
4. Wait for the project to be created (takes ~2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project, go to **Settings** → **API**
2. You'll need these two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1...` (the longer one labeled "anon" or "public")

3. Add them to your `.env.local` file:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Run the Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql` from this repository
4. Paste it into the SQL Editor
5. Click "Run" to execute the schema

This creates all the necessary tables:
- `profiles` - User profile information
- `user_settings` - Theme, sound preferences, etc.
- `user_stats` - Workout statistics
- `workouts` - Saved workout configurations
- `workout_sessions` - Workout history
- `personal_records` - Personal best records
- `recent_activity` - Activity log
- `workout_presets` - Saved workout presets

## Step 4: Configure Google OAuth (Required for Google Sign-In)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Go to **APIs & Services** → **Credentials**
4. Click "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen if prompted
6. For Application Type, select "Web application"
7. Add the following:
   - **Authorized JavaScript origins**: 
     - `https://your-project-id.supabase.co`
   - **Authorized redirect URIs**:
     - `https://your-project-id.supabase.co/auth/v1/callback`
8. Save and copy the **Client ID** and **Client Secret**

### Add Google Provider to Supabase

1. In your Supabase project, go to **Authentication** → **Providers**
2. Find "Google" and enable it
3. Paste your **Client ID** and **Client Secret**
4. Save

## Step 5: Configure Site URL

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your app's URL:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
3. Add to **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback` (for production)

## Step 6: Start the App

```bash
npm run dev
```

Visit `http://localhost:3000` - you should now be able to:
- Continue as guest (data stored locally)
- Sign in with Google (data synced to Supabase)

## Troubleshooting

### "Invalid API key" error
- Make sure you copied the **anon** key, not the **service_role** key
- Check that `.env.local` doesn't have any extra spaces

### Google sign-in not working
- Verify the redirect URIs match exactly
- Check that the Google provider is enabled in Supabase
- Make sure your Site URL is correct in Supabase

### Database errors
- Run the schema SQL again if tables are missing
- Check the SQL Editor for any error messages

## Security Notes

- The `anon` key is safe to expose in the browser - it has Row Level Security (RLS)
- Never expose the `service_role` key in client-side code
- All user data is protected by RLS policies that ensure users can only access their own data

## Data Migration (Optional)

If you have existing localStorage data and want to migrate to Supabase:
1. Sign in with Google
2. The app will automatically create your profile in Supabase
3. Local preset data remains accessible and can be re-saved while signed in
