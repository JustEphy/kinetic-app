# 🗄️ Database Setup Verification Guide

## Critical Issue: Did You Run the Schema?

**The API log you showed only proves AUTH works.** It doesn't show if your database tables exist!

---

## ✅ Step 1: Verify Tables Exist in Supabase

1. **Go to Supabase Dashboard** → **Table Editor**

2. **Check if these tables exist:**
   - [ ] `profiles`
   - [ ] `user_settings`
   - [ ] `user_stats`
   - [ ] `workout_presets` ⚠️ **THIS IS THE IMPORTANT ONE**
   - [ ] `workout_sessions`
   - [ ] `workouts`
   - [ ] `personal_records`
   - [ ] `recent_activity`

3. **If tables DON'T exist:**
   - Go to **SQL Editor** in Supabase
   - Open your `schema.sql` file
   - Copy ALL the SQL
   - Paste into SQL Editor
   - Click **Run**

---

## ✅ Step 2: Check Postgres Logs (The Right Logs!)

The API Gateway log you showed is just the auth check. You need to see the **actual database INSERT attempt**.

### Where to Find Postgres Logs:

1. **Supabase Dashboard** → **Logs** → **Postgres Logs**
2. Filter by your user ID: `16da1878-225f-46da-92ee-edf09b18a52e`
3. Look for entries around the time you tried to save (April 6, 2026 04:51:19)

### What to Look For:

**If you see errors like:**
```
ERROR: relation "workout_presets" does not exist
```
👉 **Tables weren't created!** Run schema.sql

**If you see:**
```
ERROR: permission denied for table workout_presets
```
👉 **RLS policy issue** - Check policies exist

**If you see:**
```
INSERT INTO workout_presets (id, user_id, ...) VALUES (...)
```
👉 **Request is reaching database** - Good sign!

---

## ✅ Step 3: Verify RLS Policies

After tables are created, verify policies exist:

1. **Supabase Dashboard** → **Authentication** → **Policies**
2. Find `workout_presets` table
3. Should see these policies:
   - ✅ "Users can view own presets or defaults" (SELECT)
   - ✅ "Users can insert own presets" (INSERT)
   - ✅ "Users can update own presets" (UPDATE)
   - ✅ "Users can delete own presets" (DELETE)

**If policies are missing:**
- Run the schema.sql again (it includes policy creation)

---

## ✅ Step 4: Test Direct Insert

In **Supabase SQL Editor**, test a direct insert:

```sql
-- Replace with your actual user ID from the log
INSERT INTO workout_presets (
  id, 
  user_id, 
  name, 
  description, 
  duration, 
  intervals,
  is_default
) VALUES (
  'test-manual-insert',
  '16da1878-225f-46da-92ee-edf09b18a52e'::uuid,
  'Manual Test Preset',
  'Testing direct insert',
  10,
  '[{"type": "work", "duration": 300, "name": "Test"}]'::jsonb,
  false
);
```

**If this fails:**
- Error message will tell you exactly what's wrong
- Might be: table doesn't exist, column mismatch, RLS policy, etc.

**If it succeeds:**
- Delete it: `DELETE FROM workout_presets WHERE id = 'test-manual-insert';`
- Problem is in your app code, not database

---

## ✅ Step 5: Check App Logs on Production

If tables exist and manual insert works, check your **deployed app logs**:

### If deployed on Vercel:
1. Go to your Vercel dashboard
2. Click your project → **Logs**
3. Filter to the time you tried to save
4. Look for errors from the save handler

### What to Look For:
```
[AUTH-CONTEXT] saveWorkoutPreset called {...}
[SUPABASE-DATASTORE] saveWorkoutPreset called {...}
[SUPABASE-DATASTORE] Upsert response {error: ...}
```

The console logs we added will show exactly where it's failing.

---

## 🚨 Most Common Issues

### Issue #1: Tables Don't Exist
**Symptom:** Preset save times out, no error shown
**Fix:** Run `schema.sql` in Supabase SQL Editor

### Issue #2: RLS Policies Blocking
**Symptom:** Error 42501 "permission denied"
**Fix:** 
1. Check policies exist
2. Make sure `auth.uid()` matches your user ID
3. Temporarily disable RLS to test: `ALTER TABLE workout_presets DISABLE ROW LEVEL SECURITY;`

### Issue #3: Server-Side Auth Not Working
**Symptom:** `auth_user` is null in Postgres logs
**Fix:** 
1. Check if cookies are being sent to API routes
2. Verify `@supabase/ssr` is creating server client correctly
3. Check your proxy.ts is passing auth headers

### Issue #4: Wrong User ID Format
**Symptom:** RLS policies fail silently
**Fix:** 
- Database expects UUID: `16da1878-225f-46da-92ee-edf09b18a52e`
- App might be sending TEXT: `"user123"`
- Check console logs for `userId` value

---

## 📋 Quick Diagnostic Checklist

Run through this in order:

- [ ] Tables exist in Supabase Table Editor
- [ ] RLS policies exist in Authentication → Policies
- [ ] Manual INSERT works in SQL Editor
- [ ] Postgres logs show the INSERT attempt
- [ ] App console logs show save was called
- [ ] User ID in app matches user ID in database
- [ ] Auth token is being sent with request

Once you find which step fails, you'll know exactly where the problem is!

---

## 💡 Next Steps

1. **Check Table Editor first** - This is the #1 issue
2. **Then check Postgres Logs** - Not API Gateway logs
3. **Run the `/debug` page on your deployed site** - It will show auth state
4. **Share the Postgres log entry** if you still have issues

The API Gateway log you shared shows auth is working, but we need to see what happens when it tries to INSERT into the database!
