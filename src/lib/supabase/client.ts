/**
 * Supabase Client Configuration
 * Browser client for client-side operations
 */

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  console.log('[SUPABASE-CLIENT] Creating Supabase client');
  
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: {
          getItem: (key) => {
            const value = window.localStorage.getItem(key);
            console.log('[SUPABASE-STORAGE] getItem', { key, hasValue: !!value });
            return value;
          },
          setItem: (key, value) => {
            console.log('[SUPABASE-STORAGE] setItem', { key, valueLength: value?.length });
            window.localStorage.setItem(key, value);
          },
          removeItem: (key) => {
            console.log('[SUPABASE-STORAGE] removeItem', { key });
            window.localStorage.removeItem(key);
          },
        },
      },
    }
  );

  // Log auth state changes
  client.auth.onAuthStateChange((event, session) => {
    console.log('[SUPABASE-CLIENT] Auth state changed:', {
      event,
      hasSession: !!session,
      userId: session?.user?.id,
    });
  });

  return client;
}

// Export a singleton for easy access
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = createClient();
  }
  return supabaseInstance;
}
