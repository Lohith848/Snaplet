import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars: string[] = [];
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');
  
  const errorMsg = `Supabase configuration is missing! Missing environment variables: ${missingVars.join(', ')}. 
    
For local development: Add these to .env.local
For Vercel: Add these in Project Settings > Environment Variables

Required variables:
- VITE_SUPABASE_URL=https://ynhjcydfvdobzbmoebdp.supabase.co
- VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluaGpjeWRmdmRvYnpibW9lYmRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MTk2MjUsImV4cCI6MjA5MzE5NTYyNX0.A0bYR-wVkjANKiE5AtDl0Mrw7LWkcYoKPaHUkY-gcNc`;
  
  console.error(errorMsg);
  
  if (typeof window !== 'undefined') {
    document.body.innerHTML = `
      <div style="background: black; color: red; font-family: monospace; padding: 20px; height: 100vh; overflow: auto;">
        <h1 style="color: white; margin-bottom: 20px;">Configuration Error</h1>
        <pre>${errorMsg.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
      </div>
    `;
  }
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
