import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qiciaqxucmvwwfvodqzz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpY2lhcXh1Y212d3dmdm9kcXp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzU1NjgwOSwiZXhwIjoyMDkzMTMyODA5fQ.U3LvHaELLtBfLDsr3Eet1nwJCscuo0KK6v5h3sk6eQY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    try {
        const { data, error } = await supabase.from('articles').select('*').limit(1);
        if (error) {
            console.error('Error:', error.message);
        } else {
            console.log('SUCCESS! Articles found:', data.length);
        }
    } catch (e) {
        console.error('Catch:', e);
    }
}

check();
