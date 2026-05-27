-- Create a table for site-wide content strings
CREATE TABLE IF NOT EXISTS site_content (
  id TEXT PRIMARY KEY, -- e.g. 'hero_title', 'hero_subtitle'
  key_label TEXT NOT NULL, -- Human readable label
  value TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Public can read
CREATE POLICY "Public can view site content"
ON site_content FOR SELECT
TO anon, authenticated
USING (true);

-- Admin can manage
CREATE POLICY "Admins can manage site content"
ON site_content FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Initial Data
INSERT INTO site_content (id, key_label, value, category) VALUES
('hero_title', 'Hero Title', 'Designing digital futures through code and craft.', 'homepage'),
('hero_subtitle', 'Hero Subtitle', 'Creative technologist focusing on immersive experiences and high-performance systems.', 'homepage'),
('footer_copy', 'Footer Text', '© 2026 ZPennachi. All rights reserved.', 'global'),
('social_github', 'Github Link', 'https://github.com/zpennachi', 'social'),
('social_linkedin', 'LinkedIn Link', 'https://linkedin.com/in/zpennachi', 'social')
ON CONFLICT (id) DO NOTHING;
