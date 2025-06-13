
-- Fjern eksisterende politikker hvis de findes
DROP POLICY IF EXISTS "Users can view their own materials" ON public.materials;
DROP POLICY IF EXISTS "Users can create their own materials" ON public.materials;
DROP POLICY IF EXISTS "Users can update their own materials" ON public.materials;
DROP POLICY IF EXISTS "Users can delete their own materials" ON public.materials;
DROP POLICY IF EXISTS "Public materials are viewable by everyone" ON public.materials;
DROP POLICY IF EXISTS "Users can view all public materials" ON public.materials;

DROP POLICY IF EXISTS "Users can view their own folders" ON public.folders;
DROP POLICY IF EXISTS "Users can create their own folders" ON public.folders;
DROP POLICY IF EXISTS "Users can update their own folders" ON public.folders;
DROP POLICY IF EXISTS "Users can delete their own folders" ON public.folders;

-- Aktivér RLS hvis ikke allerede aktiveret
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Opret nye politikker for materials
CREATE POLICY "Users can view their own materials" 
  ON public.materials 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own materials" 
  ON public.materials 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own materials" 
  ON public.materials 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own materials" 
  ON public.materials 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Offentlige materialer kan ses af alle (for delte links)
CREATE POLICY "Public materials are viewable by everyone" 
  ON public.materials 
  FOR SELECT 
  USING (is_public = true);

-- Opret nye politikker for folders
CREATE POLICY "Users can view their own folders" 
  ON public.folders 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders" 
  ON public.folders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders" 
  ON public.folders 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders" 
  ON public.folders 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Mapper med offentlige materialer kan ses af alle (for delte mappe-links)
CREATE POLICY "Folders with public materials are viewable by everyone" 
  ON public.folders 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.materials 
      WHERE materials.folder_id = folders.id 
      AND materials.is_public = true
    )
  );
