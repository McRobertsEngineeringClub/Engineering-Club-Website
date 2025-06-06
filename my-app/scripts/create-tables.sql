-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  technologies TEXT[] NOT NULL DEFAULT '{}',
  github_url TEXT,
  demo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create executives table
CREATE TABLE IF NOT EXISTS executives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  grade INTEGER NOT NULL CHECK (grade >= 9 AND grade <= 12),
  role TEXT NOT NULL,
  image_url TEXT NOT NULL,
  graduation_year INTEGER NOT NULL,
  is_alumni BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('meeting', 'project', 'competition', 'general')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE executives ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public read access on executives" ON executives FOR SELECT USING (true);
CREATE POLICY "Allow public read access on announcements" ON announcements FOR SELECT USING (true);

-- Allow authenticated users to insert, update, delete
CREATE POLICY "Allow authenticated insert on projects" ON projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on projects" ON projects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete on projects" ON projects FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert on executives" ON executives FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on executives" ON executives FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete on executives" ON executives FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert on announcements" ON announcements FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on announcements" ON announcements FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete on announcements" ON announcements FOR DELETE USING (auth.role() = 'authenticated');

-- Storage policies
CREATE POLICY "Allow public read access on images" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Allow authenticated upload on images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on images" ON storage.objects FOR UPDATE USING (bucket_id = 'images' AND auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete on images" ON storage.objects FOR DELETE USING (bucket_id = 'images' AND auth.role() = 'authenticated');
