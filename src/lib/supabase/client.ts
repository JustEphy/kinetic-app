/**
 * Supabase Client Configuration
 * Browser client for client-side operations
 */

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const authDebugEnabled = process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true';
  const timeoutMs = Number(process.env.NEXT_PUBLIC_AUTH_HTTP_TIMEOUT_MS ?? 12000);
  
  const timedFetch: typeof fetch = async (input, init) => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
    const startedAt = performance.now();

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });

      if (authDebugEnabled) {
        const url = typeof input === 'string' ? input : input.toString();
        console.info('[auth-debug] supabase-fetch:success', {
          url,
          status: response.status,
          durationMs: Math.round(performance.now() - startedAt),
        });
      }

      return response;
    } catch (error) {
      const url = typeof input === 'string' ? input : input.toString();
      const isTimeout = error instanceof DOMException && error.name === 'AbortError';
      
      if (authDebugEnabled) {
        console.warn('[auth-debug] supabase-fetch:error', {
          url,
          durationMs: Math.round(performance.now() - startedAt),
          isTimeout,
          error,
        });
      }

      // Don't wrap timeout errors - let Supabase handle them
      if (isTimeout) {
        console.error(`[SUPABASE] Request timed out after ${timeoutMs}ms: ${url}`);
      }
      
      throw error;
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: timedFetch,
      },
    }
  );
}

// Export a singleton for easy access
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = createClient();
  }
  return supabaseInstance;
}
