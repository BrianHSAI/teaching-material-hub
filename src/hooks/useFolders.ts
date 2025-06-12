
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Folder {
  id: string;
  name: string;
  color: string;
  created_at: string;
  user_id: string;
}

export const useFolders = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFolders = async () => {
    if (!user) {
      setFolders([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke hente mapper",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async (name: string, color: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('folders')
        .insert([{
          name,
          color,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setFolders(prev => [data, ...prev]);
      toast({
        title: "Mappe oprettet",
        description: `Mappen "${name}" er blevet oprettet`
      });
      
      return data;
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke oprette mappen",
        variant: "destructive"
      });
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id); // Ensure user can only delete their own folders

      if (error) throw error;

      setFolders(prev => prev.filter(f => f.id !== id));
      toast({
        title: "Mappe slettet",
        description: "Mappen er blevet slettet"
      });
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke slette mappen",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchFolders();
  }, [user]);

  return {
    folders,
    loading,
    createFolder,
    deleteFolder,
    refetch: fetchFolders
  };
};
