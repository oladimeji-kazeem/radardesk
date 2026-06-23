import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const DB_FILE = path.join(process.cwd(), 'db.json');

async function seed() {
    if (!fs.existsSync(DB_FILE)) {
        console.error('db.json not found');
        return;
    }

    const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));

    console.log('Seeding users...');
    const { error: errorUsers } = await supabase.from('users').upsert(db.users);
    if (errorUsers) console.error('Error seeding users:', errorUsers);

    console.log('Seeding topics...');
    // Adjust topics to match column names in schema (submitter_id, etc)
    const topicsToSeed = db.topics.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        category: t.category,
        status: t.status,
        submitter_id: t.submitterId,
        submitter_name: t.submitterName,
        claimed_by_id: t.claimedById,
        claimed_by_name: t.claimedByName,
        claimed_at: t.claimedAt,
        duration_minutes: t.durationMinutes,
        released_count: t.releasedCount,
        moderation_history: t.moderationHistory
    }));
    const { error: errorTopics } = await supabase.from('topics').upsert(topicsToSeed);
    if (errorTopics) console.error('Error seeding topics:', errorTopics);

    console.log('Seeding articles...');
    const articlesToSeed = db.articles.map((a: any) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        status: a.status,
        writer_id: a.writerId,
        writer_name: a.writerName,
        editor_id: a.editorId,
        editor_name: a.editorName,
        topic_id: a.topicId,
        score: a.score,
        review_cycles: a.reviewCycles,
        created_at: a.createdAt,
        submitted_at: a.submittedAt,
        updated_at: a.updatedAt,
        revisions: a.revisions,
        ai_validation: a.aiValidation,
        comments: a.comments,
        history: a.history
    }));
    const { error: errorArticles } = await supabase.from('articles').upsert(articlesToSeed);
    if (errorArticles) console.error('Error seeding articles:', errorArticles);

    console.log('Seeding config...');
    const { error: errorConfig } = await supabase.from('workflow_config').upsert({ id: 1, config: db.config });
    if (errorConfig) console.error('Error seeding config:', errorConfig);

    console.log('Seeding analytics...');
    const { error: errorAnalytics } = await supabase.from('web_analytics').upsert({
        id: 1,
        page_views: db.analytics.pageViews,
        submissions_count: db.analytics.submissionsCount,
        approvals_count: db.analytics.approvalsCount,
        escalations_count: db.analytics.escalationsCount,
        avg_time_seconds: db.analytics.avgTimeSeconds,
        active_users: db.analytics.activeUsers
    });
    if (errorAnalytics) console.error('Error seeding analytics:', errorAnalytics);

    console.log('Seeding complete!');
}

seed().catch(console.error);
