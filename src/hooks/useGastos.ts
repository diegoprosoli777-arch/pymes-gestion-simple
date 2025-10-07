import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

export interface Gasto {
  id: string;
  fecha: string;
  proveedor: string;
  monto: number;
  tipo: 'operativo' | 'insumo' | 'otro';
  categoria_fiscal: string;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export const useGastos = () => {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGastos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('gastos')
        .select('*')
        .eq('user_id', user.id)
        .order('fecha', { ascending: false });
      
      if (error) throw error;
      setGastos((data || []) as Gasto[]);
    } catch (error) {
      console.error('Error fetching gastos:', error);
      toast.error('Error al cargar gastos');
    } finally {
      setLoading(false);
    }
  };

  const createGasto = async (gasto: Omit<Gasto, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('gastos')
        .insert([{ ...gasto, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      
      setGastos(prev => [data as Gasto, ...prev]);
      toast.success('Gasto registrado exitosamente');
      return data;
    } catch (error) {
      console.error('Error creating gasto:', error);
      toast.error('Error al registrar gasto');
      throw error;
    }
  };

  const updateGasto = async (id: string, updates: Partial<Gasto>) => {
    try {
      const { data, error } = await supabase
        .from('gastos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setGastos(prev => prev.map(g => g.id === id ? data as Gasto : g));
      toast.success('Gasto actualizado exitosamente');
      return data;
    } catch (error) {
      console.error('Error updating gasto:', error);
      toast.error('Error al actualizar gasto');
      throw error;
    }
  };

  const deleteGasto = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gastos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setGastos(prev => prev.filter(g => g.id !== id));
      toast.success('Gasto eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting gasto:', error);
      toast.error('Error al eliminar gasto');
      throw error;
    }
  };

  useEffect(() => {
    fetchGastos();
  }, []);

  return {
    gastos,
    loading,
    createGasto,
    updateGasto,
    deleteGasto,
    refetch: fetchGastos
  };
};