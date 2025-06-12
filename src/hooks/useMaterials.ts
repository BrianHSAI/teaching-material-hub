
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Material {
  id: string;
  title: string;
  author: string;
  source?: string;
  format: string;
  genre: string;
  language: string;
  difficulty: string;
  class_level: string;
  tags: string[];
  is_public: boolean;
  file_url: string;
  folder_id?: string;
  created_at: string;
  download_count: number;
  user_id: string;
}

export const useMaterials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMaterials = async () => {
    if (!user) {
      setMaterials([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('user_id', user.id)  // Only fetch user's own materials
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setMaterials(data || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke hente materialer",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createMaterial = async (materialData: Omit<Material, 'id' | 'created_at' | 'download_count' | 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('materials')
        .insert([{
          ...materialData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setMaterials(prev => [data, ...prev]);
      toast({
        title: "Materiale oprettet",
        description: "Dit materiale er blevet gemt"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating material:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke gemme materialet",
        variant: "destructive"
      });
    }
  };

  const updateMaterial = async (id: string, updates: Partial<Material>) => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id) // Ensure user can only update their own materials
        .select()
        .single();

      if (error) throw error;

      setMaterials(prev => prev.map(m => m.id === id ? data : m));
      return data;
    } catch (error) {
      console.error('Error updating material:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke opdatere materialet",
        variant: "destructive"
      });
    }
  };

  const deleteMaterial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id); // Ensure user can only delete their own materials

      if (error) throw error;

      setMaterials(prev => prev.filter(m => m.id !== id));
      toast({
        title: "Materiale slettet",
        description: "Materialet er blevet slettet"
      });
    } catch (error) {
      console.error('Error deleting material:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke slette materialet",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [user]);

  return {
    materials,
    loading,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    refetch: fetchMaterials
  };
};
