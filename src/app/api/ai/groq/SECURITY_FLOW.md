# Groq AI API Security Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT REQUEST                            │
│                    POST /api/ai/groq                             │
│              { prompt: "30 min HIIT workout" }                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  🔒 SECURITY LAYER 1                             │
│               Authentication Check (Flexible)                    │
│                                                                  │
│  ✓ Check for Supabase session                                   │
│  ✓ Authenticated users → use user.id                            │
│  ✓ Guest users → use IP address                                 │
│  ✓ Both user types are allowed                                  │
└─────────────────────────┬───────────────────────────────────────┘
                          │ identifier: "abc123..." OR "guest:192.168.1.1"
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ⏱️  SECURITY LAYER 2                             │
│              Rate Limiting (Per User or IP)                      │
│                                                                  │
│  ✓ Check request count for identifier                           │
│  ✓ Authenticated: rate limit by user.id                         │
│  ✓ Guest: rate limit by IP address                              │
│  ✓ Limit: 10 requests per 60 seconds                            │
│  ✗ Return 429 if limit exceeded                                 │
│  ✓ Add rate limit headers to response                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Remaining: 7/10
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  🛡️  SECURITY LAYER 3                             │
│                   Input Validation                               │
│                                                                  │
│  ✓ Check payload size < 10KB                                    │
│  ✓ Validate JSON structure                                      │
│  ✓ Check prompt is string                                       │
│  ✓ Check prompt length 3-500 chars                              │
│  ✓ Sanitize: remove <> characters                               │
│  ✗ Return 400/413 if invalid                                    │
└─────────────────────────┬───────────────────────────────────────┘
                          │ sanitizedPrompt: "30 min HIIT workout"
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  🔑 SECURITY LAYER 4                             │
│                    API Key Check                                 │
│                                                                  │
│  ✓ Verify GROQ_API_KEY exists                                   │
│  ✓ API key never sent to client                                 │
│  ✗ Return 503 if not configured                                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │ apiKey: "gsk_***"
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ⏰ SECURITY LAYER 5                              │
│                   Timeout Protection                             │
│                                                                  │
│  ✓ Create AbortController                                       │
│  ✓ Set 10 second timeout                                        │
│  ✓ Call Groq API with abort signal                              │
│  ✗ Return 504 if timeout                                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
                  ┌───────────────┐
                  │   GROQ API    │
                  │  llama-3.3    │
                  └───────┬───────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  📊 SECURITY LAYER 6                             │
│                   Response Validation                            │
│                                                                  │
│  ✓ Check HTTP status (200, 429, etc.)                           │
│  ✓ Parse JSON response                                          │
│  ✓ Extract AI content                                           │
│  ✓ Validate JSON format                                         │
│  ✗ Return 502 if invalid                                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ✅ SECURITY LAYER 7                              │
│                   Output Sanitization                            │
│                                                                  │
│  ✓ Clamp totalDuration: 60s - 7200s                             │
│  ✓ Clamp workDuration: 10s - 600s                               │
│  ✓ Clamp restDuration: 5s - 300s                                │
│  ✓ Clamp intensity: 1 - 100                                     │
│  ✓ Limit name length to 100 chars                               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  📤 SECURE RESPONSE                               │
│                                                                  │
│  Status: 200 OK                                                  │
│  Headers:                                                        │
│    X-RateLimit-Limit: 10                                        │
│    X-RateLimit-Remaining: 6                                     │
│  Body: {                                                         │
│    totalDuration: 1800,                                          │
│    workDuration: 60,                                             │
│    restDuration: 30,                                             │
│    intensity: 85,                                                │
│    name: "HIIT Blast 30"                                         │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Error Flow Examples

### Guest User (Allowed)
```
Client Request → Auth Check (no session) → Use IP for rate limiting ✓
              → Rate Limit ✓ → Input ✓ → Process Request → 200 OK ✅
```

### Authenticated User (Allowed)
```
Client Request → Auth ✓ → Rate Limit Check → 429 Too Many Requests ❌
                                             { error: "Rate limit exceeded" }
                                             Retry-After: 60
```

### Invalid Input
```
Client Request → Auth ✓ → Rate Limit ✓ → Input Validation → 400 Bad Request ❌
                                                             { error: "Prompt too short" }
```

### Timeout
```
Client Request → Auth ✓ → Rate Limit ✓ → Input ✓ → API Key ✓ 
              → Groq API (slow) → Timeout (10s) → 504 Gateway Timeout ❌
                                                   { error: "Request timeout" }
```

### Success Path
```
Client Request → Auth ✓ → Rate Limit ✓ → Input ✓ → API Key ✓ 
              → Groq API ✓ → Response Validation ✓ → Output Sanitization ✓ 
              → 200 OK ✅ + Rate Limit Headers
```

## Security Metrics

| Layer | Protection Against | Status |
|-------|-------------------|--------|
| Authentication | Tracks user/guest identity | ✅ |
| Rate Limiting | DoS, API abuse (per user/IP) | ✅ |
| Input Validation | Injection, malformed data | ✅ |
| API Key Check | Misconfiguration | ✅ |
| Timeout | Resource exhaustion | ✅ |
| Response Validation | Malformed AI output | ✅ |
| Output Sanitization | Extreme values | ✅ |

**Defense in Depth: 7 Security Layers** 🔒🔒🔒🔒🔒🔒🔒
