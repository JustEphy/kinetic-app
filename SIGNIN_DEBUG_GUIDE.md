# 🔍 Sign-In Debug Guide

## I've Added Detailed Logging

After deploying the latest code, you'll see detailed console logs when signing in:

```
[AUTH] Attempting sign in...
[AUTH] Sign in successful {userId: "...", hasSession: true}
[auth-debug] onAuthStateChange:received {event: "SIGNED_IN", hasSession: true}
[auth-debug] onAuthStateChange:loaded-user-data {userId: "...", durationMs: 1234}
[SIGNIN] Redirecting to /home
```

---

## 🧪 Step-by-Step Testing

### Step 1: Deploy Latest Code

```bash
git add .
git commit -m "Add detailed sign-in logging"
git push
```

Wait for Vercel to finish deploying.

### Step 2: Open DevTools BEFORE Signing In

1. Go to https://kinetic-app-eight.vercel.app/auth/signin
2. Open Chrome DevTools (F12)
3. Go to **Console** tab
4. **Important:** Check the "Preserve log" checkbox (top of console)
5. Clear the console (click trash icon)

### Step 3: Try to Sign In

Enter your credentials and click Login.

### Step 4: Check Console Output

Look for these log messages (in order):

**✅ Good Flow:**
```
[SIGNIN] Attempting sign in...
[AUTH] Sign in successful {userId: "abc-123", hasSession: true}
[auth-debug] onAuthStateChange:received {event: "SIGNED_IN"}
[auth-debug] onAuthStateChange:loaded-user-data {durationMs: 1500}
[SIGNIN] Redirecting to /home
```

**❌ If you see this:**
```
[SIGNIN] Attempting sign in...
[AUTH] Email sign-in error: {...}
```
→ Wrong email/password, or Supabase auth not configured

**❌ If you see this:**
```
[SIGNIN] Attempting sign in...
[AUTH] Sign in successful
(then nothing else)
```
→ Auth state change listener not firing - likely cookie issue

**❌ If nothing logs at all:**
→ JavaScript error preventing execution

---

## 🚨 Common Issues & Fixes

### Issue 1: "Invalid login credentials"

**Cause:** Wrong email/password, or user doesn't exist

**Fix:** 
1. Try resetting password with "Forgot password?"
2. Or create new account with "Create one"
3. Check Supabase Dashboard → Authentication → Users to see if user exists

---

### Issue 2: Sign in succeeds but listener doesn't fire

**Logs show:**
```
[AUTH] Sign in successful
(no onAuthStateChange logs)
```

**Cause:** Cookies not being set/read properly

**Fix:**
1. Check Cookies in DevTools:
   - F12 → Application tab → Cookies → https://kinetic-app-eight.vercel.app
   - Should see cookies starting with `sb-`
   
2. If no Supabase cookies appear:
   - Cookies might be blocked
   - Try in Incognito mode
   - Check browser privacy settings
   
3. Verify Supabase URL config:
   - Site URL should be: `https://kinetic-app-eight.vercel.app`
   - Redirect URLs should include: `https://kinetic-app-eight.vercel.app/**`

---

### Issue 3: Cookies exist but listener still doesn't fire

**Fix:** Check the middleware is running
1. Add this to `src/proxy.ts` line 5:
   ```typescript
   console.log('[PROXY] Running for:', request.nextUrl.pathname);
   ```
2. Rebuild and deploy
3. Should see `[PROXY] Running for: /home` in console

---

### Issue 4: Everything logs correctly but still hangs

**Logs show:**
```
✅ All logs appear in correct order
✅ Redirect to /home happens
❌ But still shows loading spinner
```

**Fix:** Check `/home` page itself
1. Visit https://kinetic-app-eight.vercel.app/home directly
2. If it loads fine, issue is with redirect timing
3. If it hangs, issue is in home page code

---

## 📋 Information to Share

If still not working after deploying latest code, share:

1. **Full console log** from sign-in attempt (copy/paste all `[SIGNIN]` and `[AUTH]` logs)
2. **Cookie screenshot** from DevTools → Application → Cookies
3. **Network tab** - any failed requests (red status codes)?
4. **Current Supabase URL config** - Site URL and Redirect URLs

This will help me pinpoint the exact issue!

---

## 💡 Quick Sanity Checks

Before testing, verify:
- [ ] Latest code is deployed (check Vercel dashboard deployment time)
- [ ] Supabase redirect URLs include `https://kinetic-app-eight.vercel.app/**`
- [ ] DevTools console is open with "Preserve log" checked
- [ ] You're using the correct email/password

Then try signing in and share what the console shows!
