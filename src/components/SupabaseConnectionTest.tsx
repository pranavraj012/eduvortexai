import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';

export default function SupabaseConnectionTest() {
  const [status, setStatus] = useState('Testing...');
  const [error, setError] = useState<string | null>(null);
  const [envInfo, setEnvInfo] = useState({
    url: '',
    key: ''
  });
  
  useEffect(() => {
    // Check environment variables
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    setEnvInfo({
      url: url ? 'Set' : 'Not set',
      key: key ? 'Set' : 'Not set'
    });
    
    // Test connection
    testConnection();
  }, []);
  
  async function testConnection() {
    try {
      // Simple test query
      const { error } = await supabase.from('roadmaps').select('id').limit(1);
      
      if (error) throw error;
      
      setStatus('Connected');
      setError(null);
    } catch (err) {
      console.error('Supabase connection test failed:', err);
      setStatus('Failed');
      setError(err.message);
    }
  }
  
  return (
    <Card className="mt-4 bg-slate-800/50">
      <CardContent className="pt-4 text-xs">
        <div className="grid grid-cols-2 gap-1">
          <div>Supabase URL:</div>
          <div className={envInfo.url === 'Set' ? 'text-green-400' : 'text-red-400'}>
            {envInfo.url}
          </div>
          
          <div>Supabase Key:</div>
          <div className={envInfo.key === 'Set' ? 'text-green-400' : 'text-red-400'}>
            {envInfo.key}
          </div>
          
          <div>Connection:</div>
          <div className={
            status === 'Connected' ? 'text-green-400' : 
            status === 'Testing...' ? 'text-yellow-400' : 'text-red-400'
          }>
            {status}
          </div>
          
          {error && (
            <>
              <div>Error:</div>
              <div className="text-red-400 break-all">{error}</div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
