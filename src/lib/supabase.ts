import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = 'https://qiciaqxucmvwwfvodqzz.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpY2lhcXh1Y212d3dmdm9kcXp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NTY4MDksImV4cCI6MjA5MzEzMjgwOX0.fnLtpAQOOcRiVsQjO0t3mGQlUbeXQKn_9lCPAtCgiFs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Detects if the app should run in standalone mode (direct Supabase communication)
 * instead of proxying through the Express server.
 */
export const isStandalone = () => {
    // Force standalone mode to true to ensure reliable direct communication 
    // with Supabase, bypassing potentially misconfigured backend auth proxy.
    return true;
};
