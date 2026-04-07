# Fix: Guest User Access to Groq AI API

## Problem
After implementing authentication on the Groq API route, guest users were getting **401 Unauthorized** errors when trying to generate AI workouts.

```
[browser] Groq API error: 401 
    at callGroqAPI (src/lib/ai.ts:60:17)
    at async generateWorkoutFromPrompt (src/lib/ai.ts:367:22)
```

## Root Cause
The security implementation initially required **Supabase authentication** for all requests. However, the Kinetic app supports:
- **Authenticated users** (with Supabase accounts)
- **Guest users** (using localStorage, no account)

The strict authentication check blocked guest users from accessing the AI feature.

## Solution
Modified the API route to support **both authenticated and guest users** while maintaining security:

### Before (Broken for Guests)
```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser();

if (authError || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

const identifier = user.id; // Only works for authenticated users
```

### After (Works for Both)
```typescript
const { data: { user } } = await supabase.auth.getUser();

// For guest users (no Supabase session), use IP-based rate limiting
// For authenticated users, use user ID
const clientIP = req.headers.get('x-forwarded-for') || 
                 req.headers.get('x-real-ip') || 
                 'unknown';
const identifier = user?.id || `guest:${clientIP}`;

// No 401 rejection - both user types are allowed
```

## Rate Limiting Strategy

### Authenticated Users
- Rate limited by **Supabase user ID**
- 10 requests per minute per user
- Identifier: `"abc123-def456-..."`

### Guest Users
- Rate limited by **IP address**
- 10 requests per minute per IP
- Identifier: `"guest:192.168.1.1"`

## Security Maintained

✅ **Rate limiting still enforced** for both user types  
✅ **Input validation** unchanged  
✅ **Output sanitization** unchanged  
✅ **Timeout protection** unchanged  
✅ **API key protection** unchanged  

The only change: **Guest users are now allowed** instead of rejected.

## IP-Based Rate Limiting

The API extracts client IP from headers:

```typescript
const clientIP = req.headers.get('x-forwarded-for') || 
                 req.headers.get('x-real-ip') || 
                 'unknown';
```

### Header Priority:
1. `x-forwarded-for` - Standard proxy/CDN header
2. `x-real-ip` - Nginx reverse proxy header  
3. `"unknown"` - Fallback if no IP detected

### Note for Production:
Ensure your reverse proxy (Vercel, Cloudflare, Nginx) is configured to pass the correct IP headers.

## Testing

### Test Authenticated User:
```bash
# With valid Supabase session cookie
curl -X POST http://localhost:3000/api/ai/groq \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{"prompt": "30 min HIIT workout"}'
```

### Test Guest User:
```bash
# Without session cookie
curl -X POST http://localhost:3000/api/ai/groq \
  -H "Content-Type: application/json" \
  -d '{"prompt": "tabata 20 minutes"}'
```

Both should return **200 OK** with workout data.

## Updated Security Model

| User Type | Rate Limit By | Identifier Example |
|-----------|---------------|-------------------|
| Authenticated | User ID | `abc123-def456-...` |
| Guest | IP Address | `guest:192.168.1.1` |

## Logs

The API now logs user type:

```
[GROQ API] Success for authenticated user abc12345...
[GROQ API] Success for guest user 192.168.1...
```

## Why This Approach?

### ✅ Pros:
- Guest users can try the AI feature without signup
- Authenticated users get better rate limit tracking (by ID, not shared IP)
- Security still enforced (rate limiting, validation, etc.)
- Encourages user conversion (guest → authenticated)

### ⚠️ Considerations:
- Multiple guests on same network share rate limit
- VPN users could bypass IP-based limits
- For stricter control, could require authentication and offer limited free tier

## Alternative Solutions Considered

### 1. Block Guest Users (Rejected)
```typescript
if (!user) {
  return NextResponse.json({ error: 'Sign up required' }, { status: 401 });
}
```
❌ Bad UX - users can't try AI before signing up

### 2. Separate Rate Limits (Future Enhancement)
```typescript
const rateLimit = user 
  ? { max: 50, window: 3600 }    // 50/hour for authenticated
  : { max: 5, window: 3600 };     // 5/hour for guests
```
✅ Good for encouraging signup, could implement later

### 3. Fingerprint-Based (More Complex)
```typescript
const fingerprint = generateFingerprint(req.headers);
const identifier = user?.id || `guest:${fingerprint}`;
```
✅ More accurate than IP, but requires additional library

## Migration Notes

No breaking changes for existing authenticated users. Guest users now work as expected.

## Summary

**Status:** ✅ Fixed  
**Impact:** Guest users can now use AI workout generation  
**Security:** Maintained (rate limiting + validation still active)  
**User Experience:** Improved (no forced signup for AI features)
