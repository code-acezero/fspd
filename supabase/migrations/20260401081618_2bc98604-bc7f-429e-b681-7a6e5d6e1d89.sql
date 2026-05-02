
-- Add cover_image column to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS cover_image text NOT NULL DEFAULT '';

-- Add cover_image column to events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS cover_image text NOT NULL DEFAULT '';

-- Create content-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('content-images', 'content-images', true) ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to content-images
CREATE POLICY "Authenticated users can upload content images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'content-images');

-- Allow public to view content images
CREATE POLICY "Public can view content images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'content-images');

-- Allow authenticated users to update their content images
CREATE POLICY "Authenticated users can update content images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'content-images');

-- Allow authenticated users to delete content images
CREATE POLICY "Authenticated users can delete content images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'content-images');
