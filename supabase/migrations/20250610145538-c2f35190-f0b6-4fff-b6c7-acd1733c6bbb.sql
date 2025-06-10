
-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create materials table to store teaching materials
CREATE TABLE public.materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  source TEXT,
  format TEXT NOT NULL,
  genre TEXT NOT NULL,
  language TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  class_level TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  file_url TEXT NOT NULL,
  folder_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  download_count INTEGER DEFAULT 0
);

-- Create folders table
CREATE TABLE public.folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Materials policies
CREATE POLICY "Users can view all public materials" ON public.materials
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own materials" ON public.materials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own materials" ON public.materials
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own materials" ON public.materials
  FOR DELETE USING (auth.uid() = user_id);

-- Folders policies
CREATE POLICY "Users can view their own folders" ON public.folders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders" ON public.folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders" ON public.folders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders" ON public.folders
  FOR DELETE USING (auth.uid() = user_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
