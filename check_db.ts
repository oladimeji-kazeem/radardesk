import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://qiciaqxucmvwwfvodqzz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    try {
        const { data: topics, error: errTopics } = await supabase.from('topics').select('*').limit(1);
        if (errTopics) {
            console.error('Error fetching topics:', errTopics);
        } else if (topics && topics.length > 0) {
            console.log('Topics keys:', Object.keys(topics[0]));
        } else {
            console.log('No topics found.');
        }

        const { data: config, error: errConfig } = await supabase.from('workflow_config').select('*').limit(1);
        if (errConfig) {
            console.error('Error fetching config:', errConfig);
        } else {
            console.log('Config rows count:', config?.length || 0);
        }

        const { data: stats, error: errStats } = await supabase.from('sector_stats').select('*').limit(1);
        if (errStats) {
            console.error('Error fetching stats:', errStats);
        } else {
            console.log('Stats rows count:', stats?.length || 0);
            if (stats && stats.length > 0) {
                console.log('Stats keys:', Object.keys(stats[0]));
            }
        }
    } catch (e) {
        console.error('Catch error:', e);
    }
}

check();
