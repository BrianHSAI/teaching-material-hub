
-- Enable RLS on materials table if not already enabled
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own materials" ON public.materials;
DROP POLICY IF EXISTS "Users can create their own materials" ON public.materials;
DROP POLICY IF EXISTS "Users can update their own materials" ON public.materials;
DROP POLICY IF EXISTS "Users can delete their own materials" ON public.materials;
DROP POLICY IF EXISTS "Public materials are viewable by everyone" ON public.materials;

-- Create new RLS policies for materials
-- Users can view their own materials
CREATE POLICY "Users can view their own materials" 
  ON public.materials 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Everyone can view public materials (for sharing)
CREATE POLICY "Public materials are viewable by everyone" 
  ON public.materials 
  FOR SELECT 
  USING (is_public = true);

-- Users can create their own materials
CREATE POLICY "Users can create their own materials" 
  ON public.materials 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own materials
CREATE POLICY "Users can update their own materials" 
  ON public.materials 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own materials
CREATE POLICY "Users can delete their own materials" 
  ON public.materials 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable RLS on folders table if not already enabled
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own folders" ON public.folders;
DROP POLICY IF EXISTS "Users can create their own folders" ON public.folders;
DROP POLICY IF EXISTS "Users can update their own folders" ON public.folders;
DROP POLICY IF EXISTS "Users can delete their own folders" ON public.folders;

-- Create RLS policies for folders
-- Users can view their own folders
CREATE POLICY "Users can view their own folders" 
  ON public.folders 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can create their own folders
CREATE POLICY "Users can create their own folders" 
  ON public.folders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own folders
CREATE POLICY "Users can update their own folders" 
  ON public.folders 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own folders
CREATE POLICY "Users can delete their own folders" 
  ON public.folders 
  FOR DELETE 
  USING (auth.uid() = user_id);
