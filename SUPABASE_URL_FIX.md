# 🔧 URGENT FIX - Supabase Auth Not Working

## The Problem

You can't sign in because Supabase is rejecting the redirect. Your current config:
```
Redirect URLs: https://kinetic-app-eight.vercel.app/auth/callback
```

This is TOO RESTRICTIVE. After sign-in, Supabase tries to redirect to `/home`, but it's not in the allowed list, so auth fails.

---

## ✅ THE FIX (2 minutes)

### Step 1: Go to Supabase Dashboard

1. Open https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **URL Configuration**

### Step 2: Update Redirect URLs

**ADD these to your Redirect URLs list:**

```
https://kinetic-app-eight.vercel.app/**
http://localhost:3000/**
```

**Keep the existing callback URL too:**
```
https://kinetic-app-eight.vercel.app/auth/callback
```

**Final list should look like:**
```
https://kinetic-app-eight.vercel.app/**
https://kinetic-app-eight.vercel.app/auth/callback
http://localhost:3000/**
http://localhost:3000/auth/callback
```

The `/**` wildcard allows ALL paths under that domain.

### Step 3: Save

Click **Save** button at the bottom of the page.

### Step 4: Test Immediately

1. Go to your site: https://kinetic-app-eight.vercel.app
2. Click sign in
3. Enter credentials
4. **Should now redirect to /home successfully!**

---

## 🎯 Why This Fixes It

Supabase checks the redirect URL against your allowed list. When you only have `/auth/callback`, it rejects any redirect to `/home`, `/workouts`, etc.

The `/**` wildcard says "allow any path under this domain", which is what you need for your app.

---

## 🧪 After Fixing - Test This

1. **Sign in** - Should work now
2. **Check /debug** - Should show ✅ Supabase Session with access token
3. **Try saving preset** - Should work instantly!

---

## 💡 This is NOT a Supabase Problem

Supabase is working fine! This is just a configuration issue that takes 2 minutes to fix. No need to:
- ❌ Delete Supabase
- ❌ Switch backends
- ❌ Start over

Just add the wildcard URLs and you're good! 🚀

---

## 🆘 If Still Not Working After This

If adding `/**` doesn't fix it, check:

1. **Browser console** - Any CORS errors?
2. **Network tab** - Does the `/auth/v1/token` request succeed (status 200)?
3. **Cookies** - Are Supabase cookies being set? (Application → Cookies in DevTools)

But 99% chance adding the wildcard URLs will fix everything!
