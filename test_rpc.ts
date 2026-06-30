import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://qiciaqxucmvwwfvodqzz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const rpcs = ['exec_sql', 'run_sql', 'execute_sql', 'exec', 'sql'];
    for (const rpc of rpcs) {
        try {
            const { data, error } = await supabase.rpc(rpc, { query_text: 'SELECT 1;', sql: 'SELECT 1;' });
            console.log(`RPC ${rpc} response:`, { data, error });
        } catch (e) {
            console.log(`RPC ${rpc} threw:`, e);
        }
    }
}

check();
