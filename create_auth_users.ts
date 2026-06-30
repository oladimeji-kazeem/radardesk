import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = 'https://qiciaqxucmvwwfvodqzz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpY2lhcXh1Y212d3dmdm9kcXp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzU1NjgwOSwiZXhwIjoyMDkzMTMyODA5fQ.U3LvHaELLtBfLDsr3Eet1nwJCscuo0KK6v5h3sk6eQY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    try {
        console.log("Listing auth users...");
        const list = await supabase.auth.admin.listUsers();
        console.log("Existing auth users count:", list.data.users?.length);
        for (const u of list.data.users || []) {
            console.log(`- ${u.email} (${u.id})`);
        }

        const targetUsers = [
            { email: 'alisha.v@travelradar.aero', password: 'password123', name: 'Alisha Vance', role: 'Writer', id: 'u-1' },
            { email: 'david.a@travelradar.aero', password: 'password123', name: 'David Admin', role: 'Admin', id: 'u-4' }
        ];

        for (const target of targetUsers) {
            const found = list.data.users?.find(u => u.email?.toLowerCase() === target.email.toLowerCase());
            let finalId = '';
            if (found) {
                console.log(`User ${target.email} already exists in auth. Updating password...`);
                const { data, error } = await supabase.auth.admin.updateUserById(found.id, {
                    password: target.password,
                    user_metadata: { full_name: target.name, role: target.role }
                });
                if (error) {
                    console.error(`Error updating ${target.email}:`, error.message);
                } else {
                    console.log(`Successfully updated ${target.email}`);
                    finalId = found.id;
                }
            } else {
                console.log(`User ${target.email} not found. Creating...`);
                const { data, error } = await supabase.auth.admin.createUser({
                    email: target.email,
                    password: target.password,
                    email_confirm: true,
                    user_metadata: { full_name: target.name, role: target.role }
                });
                if (error) {
                    console.error(`Error creating ${target.email}:`, error.message);
                } else {
                    console.log(`Successfully created ${target.email} with auth ID: ${data.user.id}`);
                    finalId = data.user.id;
                }
            }

            if (finalId) {
                // Ensure profile exists in users table under BOTH finalId and target.id
                // (just to be completely safe regardless of whether lookup uses auth UUID or legacy ID)
                console.log(`Querying profile for ${target.email}...`);
                const { error: deleteErr } = await supabase
                    .from('users')
                    .delete()
                    .eq('email', target.email);
                if (deleteErr) {
                    console.error(`Error deleting profile for ${target.email}:`, deleteErr.message);
                }

                const profileData = {
                    id: finalId, // Use the auth UUID as primary key in users table
                    name: target.name,
                    role: target.role,
                    email: target.email,
                    password: target.password,
                    approved: true
                };

                const { error: upsertErr } = await supabase.from('users').upsert(profileData);
                if (upsertErr) {
                    console.error(`Error upserting profile for ${target.email}:`, upsertErr.message);
                } else {
                    console.log(`Profile upserted successfully for ${target.email} with ID ${finalId}`);
                }

                // If legacy ID u-1 / u-4 is different from UUID, also keep legacy row but change its email
                // or just let it exist so existing reference works
            }
        }
    } catch (e) {
        console.error("Run error:", e);
    }
}

run();
