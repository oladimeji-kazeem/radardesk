-- Supabase Initial Schema for RadarDesk

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permissive" ON users;
CREATE POLICY "Permissive" ON users FOR ALL USING (true) WITH CHECK (true);

-- 2. Topics Table
CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT NOT NULL,
  submitter_id TEXT REFERENCES users(id),
  submitter_name TEXT,
  claimed_by_id TEXT REFERENCES users(id),
  claimed_by_name TEXT,
  claimed_at TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 10,
  released_count INTEGER DEFAULT 0,
  moderation_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permissive" ON topics;
CREATE POLICY "Permissive" ON topics FOR ALL USING (true) WITH CHECK (true);

-- 3. Articles Table
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  status TEXT NOT NULL,
  writer_id TEXT REFERENCES users(id),
  writer_name TEXT,
  editor_id TEXT REFERENCES users(id),
  editor_name TEXT,
  topic_id TEXT REFERENCES topics(id),
  score INTEGER DEFAULT 0,
  review_cycles INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL,
  revisions JSONB DEFAULT '[]'::jsonb,
  ai_validation JSONB,
  comments JSONB DEFAULT '[]'::jsonb,
  history JSONB DEFAULT '[]'::jsonb,
  review_count INTEGER DEFAULT 0,
  review_history JSONB DEFAULT '[]'::jsonb,
  categories JSONB DEFAULT '[]'::jsonb,
  sections JSONB DEFAULT '[]'::jsonb,
  pages JSONB DEFAULT '[]'::jsonb,
  header_image TEXT,
  excerpt TEXT
);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permissive" ON articles;
CREATE POLICY "Permissive" ON articles FOR ALL USING (true) WITH CHECK (true);

-- 4. Workflow Config Table
CREATE TABLE IF NOT EXISTS workflow_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  config JSONB NOT NULL,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE workflow_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permissive" ON workflow_config;
CREATE POLICY "Permissive" ON workflow_config FOR ALL USING (true) WITH CHECK (true);

-- 5. Web Analytics Table
CREATE TABLE IF NOT EXISTS web_analytics (
  id INTEGER PRIMARY KEY DEFAULT 1,
  page_views INTEGER DEFAULT 0,
  submissions_count INTEGER DEFAULT 0,
  approvals_count INTEGER DEFAULT 0,
  escalations_count INTEGER DEFAULT 0,
  avg_time_seconds INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE web_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permissive" ON web_analytics;
CREATE POLICY "Permissive" ON web_analytics FOR ALL USING (true) WITH CHECK (true);

-- Removed individual RLS blocks as they are now co-located with tables

-- 6. UAT Feedback Table
CREATE TABLE IF NOT EXISTS uat_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id),
  user_name TEXT,
  user_role TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_type TEXT, -- e.g. 'Bug', 'Suggestion', 'UI/UX', 'Performance'
  comments TEXT,
  browser_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE uat_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permissive" ON uat_feedback;
CREATE POLICY "Permissive" ON uat_feedback FOR ALL USING (true) WITH CHECK (true);

-- 7. Sector Stats Table
CREATE TABLE IF NOT EXISTS sector_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value TEXT,
  metric_unit TEXT,
  trend TEXT CHECK (trend IN ('up', 'down', 'stable')),
  pulse_status TEXT CHECK (pulse_status IN ('Critical', 'Nominal', 'Active', 'Steady', 'Strategic')),
  chart_data JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sub_page TEXT -- Optional for sub-page specific metrics
);

-- Enable RLS
ALTER TABLE sector_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permissive" ON sector_stats;
CREATE POLICY "Permissive" ON sector_stats FOR ALL USING (true) WITH CHECK (true);

-- 8. Portal Deals Table
CREATE TABLE IF NOT EXISTS portal_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  price TEXT NOT NULL,
  expiration TIMESTAMPTZ,
  sector TEXT NOT NULL,
  status TEXT DEFAULT 'Active',
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE portal_deals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permissive" ON portal_deals;
CREATE POLICY "Permissive" ON portal_deals FOR ALL USING (true) WITH CHECK (true);

-- 9. Portal Content Table
CREATE TABLE IF NOT EXISTS portal_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL, -- 'video', 'newsletter', 'cta', 'hero'
  title TEXT NOT NULL,
  description TEXT,
  resource_url TEXT,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  categories JSONB DEFAULT '[]'::jsonb,
  sections JSONB DEFAULT '[]'::jsonb,
  pages JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE portal_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permissive" ON portal_content;
CREATE POLICY "Permissive" ON portal_content FOR ALL USING (true) WITH CHECK (true);
