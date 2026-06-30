import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://qiciaqxucmvwwfvodqzz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    try {
        const { data, error } = await supabase.from('articles').select('*');
        if (error) {
            console.error('Error fetching articles:', error);
        } else {
            console.log(`Articles found: ${data?.length}`);
            data?.forEach(a => {
                console.log(`ID: ${a.id} | Title: ${a.title} | Status: ${a.status} | Category: ${a.category}`);
            });
        }
    } catch (e) {
        console.error('Catch error:', e);
    }
}

check();
