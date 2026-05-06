-- Site Settings table for hero image and site name
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT,
  site_logo_url TEXT,
  hero_image_url TEXT,
  hero_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profile table
CREATE TABLE IF NOT EXISTS profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_image_url TEXT,
  profile_text TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts table for webtoon, work_process, illustration
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('webtoon', 'work_process', 'illustration')),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow public read profile" ON profile;
DROP POLICY IF EXISTS "Allow public read posts" ON posts;
DROP POLICY IF EXISTS "Allow public read comments" ON comments;
DROP POLICY IF EXISTS "Allow public insert comments" ON comments;

-- Public read access for all tables (portfolio is public)
CREATE POLICY "Allow public read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read profile" ON profile FOR SELECT USING (true);
CREATE POLICY "Allow public read posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Allow public read comments" ON comments FOR SELECT USING (true);

-- Public can insert comments (visitors can comment)
CREATE POLICY "Allow public insert comments" ON comments FOR INSERT WITH CHECK (true);

-- Insert default site settings if empty
INSERT INTO site_settings (site_name, hero_text) 
SELECT 'Portfolio', 'Welcome to my portfolio'
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

-- Insert default profile if empty
INSERT INTO profile (profile_text) 
SELECT 'Hello! Welcome to my profile.'
WHERE NOT EXISTS (SELECT 1 FROM profile);
