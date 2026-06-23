import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = 'https://qiciaqxucmvwwfvodqzz.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZjpxaWNpYXF4dWNtdnd3ZnZvZHF6eiIsInJvbGUiOiJhbm9uIiwiaWF0IjoyNjM0OTI4Nzc1LCJleHAiOjM3MTY3MTQ3NzV9.m9Z6eQYnwJCscuo0KK6v5h3sk6';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Detects if the app should run in standalone mode (direct Supabase communication)
 * instead of proxying through the Express server.
 */
export const isStandalone = () => {
    // If the origin is not localhost:3000 (standard dev/prod server) 
    // or if explicitly set via env var, we assume standalone.
    return window.location.hostname !== 'localhost' || import.meta.env.VITE_STANDALONE === 'true';
};
