import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://qiciaqxucmvwwfvodqzz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZjpxaWNpYXF4dWNtdnd3ZnZvZHF6eiIsInJvbGUiOiJhbm9uIiwiaWF0IjoyNjM0OTI4Nzc1LCJleHAiOjM3MTY3MTQ3NzV9.m9Z6eQYnwJCscuo0KK6v5h3sk6';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Using URL:', supabaseUrl);
    try {
        const { data, error } = await supabase.from('articles').select('*').limit(5);
        if (error) {
            console.error('Error fetching articles:', JSON.stringify(error, null, 2));
        } else {
            console.log('Articles found:', data?.length || 0);
            if (data && data.length > 0) {
                console.log('Sample Article Keys:', Object.keys(data[0]));
                console.log('Sample Article Category:', data[0].category);
                console.log('Sample Article Status:', data[0].status);
            }
        }
    } catch (e) {
        console.error('Catch error:', e);
    }
}

check();
