'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/lib/supabase/client';

export default function DebugPage() {
  const { user } = useAuth();
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [supabaseSession, setSupabaseSession] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      setSupabaseSession(session);
      
      const keys = Object.keys(localStorage).filter(k => k.includes('supabase'));
      const authData: any = {};
      keys.forEach(key => {
        try {
          authData[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          authData[key] = localStorage.getItem(key);
        }
      });
      setAuthStatus(authData);
    };
    
    checkAuth();
  }, [user]);

  const testPresetSave = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const supabase = getSupabase();
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Session check:', { session, sessionError });
      
      if (!session) {
        setTestResult({ error: 'No active session. Please sign in first.' });
        setTesting(false);
        return;
      }
      
      const testPreset = {
        id: `test-${Date.now()}`,
        user_id: session.user.id,
        name: 'DEBUG TEST PRESET',
        description: 'This is a test preset to verify database connectivity',
        duration: 10,
        intervals: [{ type: 'work', duration: 300, name: 'Test' }],
        is_default: false,
        updated_at: new Date().toISOString(),
      };
      
      console.log('Attempting to insert test preset:', testPreset);
      
      const { data, error } = await supabase
        .from('workout_presets')
        .insert(testPreset)
        .select();
      
      console.log('Insert result:', { data, error });
      
      if (error) {
        setTestResult({ 
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
      } else {
        setTestResult({ 
          success: true, 
          data,
          message: 'Test preset saved successfully! Database connection is working.',
        });
        
        await supabase.from('workout_presets').delete().eq('id', testPreset.id);
      }
    } catch (error: any) {
      console.error('Test failed:', error);
      setTestResult({ 
        success: false,
        error: error.message || 'Unknown error',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-on-surface">🔧 Auth & Database Debug</h1>
        
        <div className="bg-surface-container rounded-2xl p-6">
          <h2 className="text-xl font-bold text-on-surface mb-4">👤 User Context</h2>
          <pre className="bg-surface p-4 rounded-lg overflow-auto text-sm text-on-surface-variant">
            {JSON.stringify(user, null, 2)}
          </pre>
          <div className="mt-4 space-y-2">
            <p className="text-on-surface">
              <strong>Is Guest:</strong> {user?.isGuest ? '✅ YES (using localStorage)' : '❌ NO (using Supabase)'}
            </p>
            <p className="text-on-surface">
              <strong>User ID:</strong> {user?.id || 'N/A'}
            </p>
            <p className="text-on-surface">
              <strong>Email:</strong> {user?.email || 'N/A'}
            </p>
          </div>
        </div>

        <div className="bg-surface-container rounded-2xl p-6">
          <h2 className="text-xl font-bold text-on-surface mb-4">🔐 Supabase Session</h2>
          {supabaseSession ? (
            <>
              <pre className="bg-surface p-4 rounded-lg overflow-auto text-sm text-on-surface-variant mb-4">
                {JSON.stringify(supabaseSession, null, 2)}
              </pre>
              <div className="space-y-2">
                <p className="text-on-surface">
                  <strong>Access Token:</strong> {supabaseSession.access_token ? '✅ Present' : '❌ Missing'}
                </p>
                <p className="text-on-surface">
                  <strong>User ID:</strong> {supabaseSession.user?.id}
                </p>
                <p className="text-on-surface">
                  <strong>Expires:</strong> {new Date(supabaseSession.expires_at * 1000).toLocaleString()}
                </p>
              </div>
            </>
          ) : (
            <p className="text-error">❌ No active Supabase session found</p>
          )}
        </div>

        <div className="bg-surface-container rounded-2xl p-6">
          <h2 className="text-xl font-bold text-on-surface mb-4">💾 LocalStorage Auth Data</h2>
          <pre className="bg-surface p-4 rounded-lg overflow-auto text-sm text-on-surface-variant">
            {JSON.stringify(authStatus, null, 2)}
          </pre>
        </div>

        <div className="bg-surface-container rounded-2xl p-6">
          <h2 className="text-xl font-bold text-on-surface mb-4">🧪 Test Database Connection</h2>
          <p className="text-on-surface-variant mb-4">
            This will attempt to insert a test preset into your database to verify:
          </p>
          <ul className="list-disc list-inside text-on-surface-variant mb-4 space-y-1">
            <li>Supabase auth token is valid</li>
            <li>RLS policies allow insertion</li>
            <li>Network connectivity is working</li>
          </ul>
          
          <button
            onClick={testPresetSave}
            disabled={testing || !supabaseSession}
            className="px-6 py-3 bg-primary text-on-primary rounded-full font-bold hover:brightness-110 disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Run Database Test'}
          </button>

          {testResult && (
            <div className={`mt-4 p-4 rounded-lg ${testResult.success ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
              {testResult.success ? (
                <>
                  <p className="text-green-400 font-bold">✅ {testResult.message}</p>
                  <pre className="text-green-300 text-sm mt-2">
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                </>
              ) : (
                <>
                  <p className="text-error font-bold">❌ Test Failed</p>
                  <p className="text-error mt-2"><strong>Error:</strong> {testResult.error}</p>
                  {testResult.code && (
                    <p className="text-error mt-1"><strong>Code:</strong> {testResult.code}</p>
                  )}
                  {testResult.hint && (
                    <p className="text-error mt-1"><strong>Hint:</strong> {testResult.hint}</p>
                  )}
                  
                  {testResult.code === '42501' && (
                    <div className="mt-4 p-3 bg-yellow-900/20 rounded border border-yellow-700">
                      <p className="text-yellow-400 font-bold">🔒 Permission Denied (RLS Policy Issue)</p>
                      <p className="text-yellow-300 text-sm mt-2">
                        This error means Row Level Security is blocking your request. Possible causes:
                      </p>
                      <ul className="list-disc list-inside text-yellow-300 text-sm mt-2 space-y-1">
                        <li>Site URL not set to localhost:3000 in Supabase dashboard</li>
                        <li>RLS policy expects auth.uid() but session user ID doesn't match</li>
                        <li>Auth token is invalid or expired</li>
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="bg-primary/10 border border-primary rounded-2xl p-6">
          <h2 className="text-xl font-bold text-primary mb-4">💡 Troubleshooting Steps</h2>
          <ol className="list-decimal list-inside text-on-surface space-y-2">
            <li>
              <strong>Check Supabase Site URL:</strong> Go to Authentication → URL Configuration.
              Set Site URL to <code className="bg-surface px-2 py-1 rounded">http://localhost:3000</code>
            </li>
            <li>
              <strong>Add Redirect URLs:</strong> Include <code className="bg-surface px-2 py-1 rounded">http://localhost:3000/**</code>
            </li>
            <li>
              <strong>Clear browser storage:</strong> DevTools → Application → Clear site data
            </li>
            <li>
              <strong>Sign out and sign in again:</strong> Visit /auth/signout then /auth/signin
            </li>
            <li>
              <strong>Run the database test above</strong>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
