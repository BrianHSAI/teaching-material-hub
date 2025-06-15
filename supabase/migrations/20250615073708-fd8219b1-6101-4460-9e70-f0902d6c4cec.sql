
-- Enable Row Level Security on the materials table
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access to materials that are marked as public
CREATE POLICY "Public can view public materials"
  ON public.materials FOR SELECT
  USING (is_public = true);

-- Create a policy that allows authenticated users to perform all actions on their own materials
CREATE POLICY "Users can manage their own materials"
  ON public.materials FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable Row Level Security on the folders table
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access to folders that contain at least one public material
CREATE POLICY "Public can view folders with public materials"
  ON public.folders FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.materials
      WHERE materials.folder_id = folders.id AND materials.is_public = true
    )
  );

-- Create a policy that allows authenticated users to perform all actions on their own folders
CREATE POLICY "Users can manage their own folders"
  ON public.folders FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
