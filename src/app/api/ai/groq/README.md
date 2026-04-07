# Groq AI API Route - Security Documentation

This API route provides a secure layer between your frontend and the Groq AI service for generating workout plans.

## Security Features

### 1. **Authentication** ✅
- Supports **both authenticated and guest users**
- Authenticated users: Rate limited by Supabase user ID
- Guest users: Rate limited by IP address
- No 401 rejections for guest access (AI feature available to all)

### 2. **Rate Limiting** ✅
- **Limit:** 10 requests per user per minute
- **Window:** 60 seconds (rolling window)
- **Response Headers:**
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `Retry-After`: Seconds to wait before retrying (on 429)
- Rate limits are per-user (identified by Supabase user ID)
- Returns `429 Too Many Requests` when exceeded

### 3. **Input Validation** ✅
- **Payload Size Limit:** 10KB maximum
- **Prompt Length:** 3-500 characters
- **Type Checking:** Validates prompt is a string
- **Sanitization:** Removes HTML-like characters (`<` `>`)
- Invalid requests return `400 Bad Request`

### 4. **Request Timeout** ✅
- **Timeout:** 10 seconds for Groq API calls
- Prevents hanging requests
- Returns `504 Gateway Timeout` on timeout

### 5. **Output Validation** ✅
- **Duration Limits:**
  - Total: 60s - 2 hours (7200s)
  - Work intervals: 10s - 10 minutes (600s)
  - Rest intervals: 5s - 5 minutes (300s)
- **Intensity:** Clamped to 1-100 range
- **Name Length:** Maximum 100 characters
- Ensures AI responses are within safe, reasonable ranges

### 6. **Error Handling** ✅
- Never exposes API keys or internal errors to client
- Generic error messages for security
- Detailed logging for debugging (server-side only)
- Proper HTTP status codes for different error types

### 7. **API Key Protection** ✅
- API key stored in environment variable (`GROQ_API_KEY`)
- Never exposed to client
- Key validation before making requests

## Usage

### Client-Side Example

```typescript
async function generateWorkout(prompt: string) {
  try {
    const response = await fetch('/api/ai/groq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please log in to use AI features');
      }
      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a minute.');
      }
      throw new Error('Failed to generate workout');
    }

    const data = await response.json();
    return data; // { totalDuration, workDuration, restDuration, intensity, name }
  } catch (error) {
    console.error('AI generation error:', error);
    throw error;
  }
}
```

### Response Headers

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
```

## Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Missing or invalid prompt | Prompt is missing, too short, or too long |
| 401 | Unauthorized | User is not authenticated |
| 413 | Request payload too large | Request body exceeds 10KB |
| 429 | Rate limit exceeded | Too many requests in the current window |
| 500 | Failed to process request | Internal server error |
| 502 | AI service unavailable | Groq API returned an error |
| 503 | Service temporarily unavailable | API key not configured |
| 504 | Request timeout | Request took longer than 10 seconds |

## Rate Limiting Notes

### Current Implementation
- **In-Memory Store:** Rate limits are stored in-memory
- **Single-Server:** Works for single-server deployments
- **Cleanup:** Old entries are cleaned every 60 seconds

### Production Recommendations
For production environments with multiple servers, use a distributed rate limiting solution:

**Redis Implementation:**
```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

async function checkRateLimit(userId: string) {
  const key = `ratelimit:groq:${userId}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, 60); // 60 second window
  }
  
  return {
    allowed: count <= 10,
    remaining: Math.max(0, 10 - count),
  };
}
```

## Environment Variables

Required environment variables:

```bash
# Groq API Key (get from https://console.groq.com/keys)
GROQ_API_KEY=gsk_...

# Supabase (for authentication)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Monitoring

The API logs important events for monitoring:

- **Success:** `[GROQ API] Success for user abc12345...`
- **Errors:** `[GROQ API] Error 429: Rate limit exceeded`
- **Timeouts:** `[GROQ API] Request timeout`
- **Config Issues:** `[GROQ API] API key not configured`

Consider adding monitoring services like:
- Sentry for error tracking
- Datadog/New Relic for performance monitoring
- Logging aggregation (CloudWatch, Logtail, etc.)

## Security Best Practices Applied

✅ **Principle of Least Privilege:** Only authenticated users can access  
✅ **Defense in Depth:** Multiple layers of validation and protection  
✅ **Fail Securely:** Generic error messages prevent information leakage  
✅ **Input Validation:** All inputs are validated and sanitized  
✅ **Rate Limiting:** Prevents abuse and DoS attacks  
✅ **Timeout Protection:** Prevents resource exhaustion  
✅ **Output Encoding:** AI responses are validated and bounded  
✅ **Separation of Concerns:** API key never exposed to client  

## Future Enhancements

Consider adding:
- [ ] Redis-based distributed rate limiting
- [ ] Request logging and analytics
- [ ] Cost tracking per user
- [ ] Usage quotas (daily/monthly limits)
- [ ] Advanced prompt filtering (content moderation)
- [ ] Response caching for common prompts
- [ ] A/B testing different AI models
- [ ] Webhook notifications for rate limit violations
