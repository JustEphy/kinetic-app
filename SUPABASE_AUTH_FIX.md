# 🔧 Supabase Auth Configuration Fix

## The Problem

If `localhost:3000` is configured as a **Redirect URL** but NOT as the **Site URL**, your authentication session won't work properly with Row Level Security (RLS) policies.

**Symptoms:**
- User appears logged in on frontend
- But database operations fail silently or timeout
- RLS policies block all requests

---

## 🚨 REQUIRED CONFIGURATION

### Step 1: Go to Supabase Dashboard

1. Open your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**

### Step 2: Set Site URL

**Set your Site URL to:**
```
http://localhost:3000
```

**This is the MAIN URL where your app runs.**

### Step 3: Add Redirect URLs

**Add these to your Redirect URLs list:**
```
http://localhost:3000/**
http://localhost:3000/auth/callback
http://localhost:3000/home
```

The `/**` wildcard allows all paths under localhost:3000.

### Step 4: Save Changes

Click **Save** at the bottom of the page.

---

## ⚠️ Common Mistake

❌ **WRONG:**
- Site URL: `https://yourdomain.com` (your production site)
- Redirect URLs: `http://localhost:3000/auth/callback`

This won't work for local development! The Site URL determines which origin can establish auth sessions.

✅ **CORRECT for Local Development:**
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/**`

✅ **CORRECT for Production:**
- Site URL: `https://yourdomain.com`
- Redirect URLs: `https://yourdomain.com/**`

---

## 🧪 How to Test After Fixing

1. **Clear all browser storage:**
   - Open DevTools (F12)
   - Go to Application tab
   - Click "Clear site data" button

2. **Sign out completely:**
   ```
   Visit: http://localhost:3000/auth/signout
   ```

3. **Sign back in:**
   ```
   Visit: http://localhost:3000/auth/signin
   ```

4. **Check auth token in console:**
   ```javascript
   // Paste this in browser console
   const session = JSON.parse(localStorage.getItem('sb-[YOUR-PROJECT-REF]-auth-token'));
   console.log('Auth session:', session);
   console.log('Access token:', session?.access_token);
   console.log('User ID:', session?.user?.id);
   ```

5. **Try saving a preset and check console logs**

---

## 🔍 How to Verify It's Working

After fixing the Supabase URL configuration, you should see in browser console:

```
[AUTH-CONTEXT] saveWorkoutPreset called {userId: "abc-123-...", isGuest: false, ...}
[AUTH-CONTEXT] Preset prepared {dataStore: "supabase"}
[SUPABASE-DATASTORE] saveWorkoutPreset called {...}
[SUPABASE-DATASTORE] Upsert response {data: [...], error: null}
✅ [SUPABASE-DATASTORE] Preset saved successfully
```

If you still see `error: {code: "42501"}` or timeout, there may be additional RLS issues.

---

## 🆘 Still Not Working?

If after fixing the Site URL you still have issues, try:

1. **Disable RLS temporarily to test:**
   ```sql
   -- In Supabase SQL Editor
   ALTER TABLE workout_presets DISABLE ROW LEVEL SECURITY;
   ```
   
   If this fixes it, the problem is your RLS policies, not auth.

2. **Check if user ID format matches:**
   - RLS expects UUID format: `123e4567-e89b-12d3-a456-426614174000`
   - Not text like: `"user123"`

3. **Verify auth token is being sent:**
   - Open DevTools → Network tab
   - Try saving a preset
   - Find the request to `supabase.co`
   - Check Headers → Authorization should have `Bearer eyJ...`

---

## 📋 Quick Checklist

- [ ] Site URL is set to `http://localhost:3000` in Supabase
- [ ] Redirect URLs include `http://localhost:3000/**`
- [ ] Cleared browser storage and signed out/in again
- [ ] Browser console shows auth token exists
- [ ] Console logs show `isGuest: false` when saving preset
- [ ] Network request includes Authorization header

Once you complete this checklist, preset saves should work immediately!
