# 🚨 SESSION MISMATCH ISSUE - DIAGNOSIS & FIX

## Problem Found

Your `/debug` page showed:
```
Is Guest: ❌ NO (using Supabase)
User ID: 16da1878-225f-46da-92ee-edf09b18a52e
Email: ephraimjdd@gmail.com

❌ No active Supabase session found  ← THE PROBLEM!
```

**What this means:**
- AuthContext has cached user data (from previous login)
- But your actual Supabase session has **expired or doesn't exist**
- When saving presets, app tries to use Supabase WITHOUT a valid auth token
- RLS policies reject the request because `auth.uid()` is NULL
- Result: Infinite hang or timeout

---

## ✅ Fixes Applied

### 1. **Better Session Initialization**
- Added error handling for expired sessions
- Automatically clears stale session data
- Logs exact session expiration time

### 2. **Debug Button Now Works**
- Removed the `disabled` check for missing session
- Button will now run the test and show you the exact error
- Added warning message when no session exists

### 3. **Better Error Logging**
- Session errors now logged to console
- Shows expiration time in debug output
- Detects when session fetch fails

---

## 🔧 What You Need To Do

### **Step 1: Deploy the Latest Code**

```bash
# In your project folder
git add .
git commit -m "Fix session persistence and debug page"
git push
```

Wait for your hosting platform to redeploy (Vercel/Netlify/etc).

### **Step 2: Force Sign Out**

Visit: `https://yoursite.com/auth/signout`

This will:
- Clear the expired session
- Remove stale AuthContext data
- Reset to clean state

### **Step 3: Sign Back In**

Visit: `https://yoursite.com/auth/signin`

Sign in with your account. This will create a **fresh session**.

### **Step 4: Verify Session**

Visit: `https://yoursite.com/debug`

You should now see:
```
✅ Supabase Session
Access Token: ✅ Present
Expires: [future date]
```

### **Step 5: Test Preset Save**

1. Go to `/workouts` 
2. Create a workout
3. Click "Save as Preset"
4. Should save instantly now!

If it still hangs, click "Run Database Test" on `/debug` to see the exact error.

---

## 🐛 Open Developer Console

**IMPORTANT:** When testing, have Chrome DevTools open (F12 → Console tab).

You'll now see detailed logs like:
```
[auth-debug] auth-init:session-result {hasSession: true, expiresAt: "2026-04-06T12:00:00.000Z"}
[AUTH-CONTEXT] saveWorkoutPreset called {userId: "...", isGuest: false}
[SUPABASE-DATASTORE] saveWorkoutPreset called {...}
[SUPABASE-DATASTORE] Preset saved successfully
```

Or if it fails:
```
[auth-debug] auth-init:session-error {error: "JWT expired"}
```

This will tell you exactly what's wrong!

---

## 🔍 Why This Happened

Supabase sessions expire after **1 hour** by default. If you:
1. Signed in an hour ago
2. Haven't refreshed the page
3. Session expired in the background

Then AuthContext still thinks you're logged in (from cached data), but Supabase knows you're not.

The fix ensures:
- Stale sessions are detected and cleared
- Fresh session check on page load
- Better error messages when session is invalid

---

## 📋 Quick Checklist

- [ ] Deploy latest code (`git push`)
- [ ] Sign out completely
- [ ] Sign back in
- [ ] Check `/debug` page shows valid session
- [ ] Try saving a preset
- [ ] Check browser console for logs

If still having issues after this, the console logs will tell us exactly what's failing!

---

## 🆘 Still Not Working?

If after following all steps you still can't save:

1. **Take screenshot of `/debug` page after signing in**
2. **Take screenshot of browser console when trying to save**
3. **Check Supabase Dashboard → Logs → Postgres Logs** for any INSERT attempts

Share those and we'll pinpoint the exact issue!
