import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

export interface Proveedor {
  id: string;
  nombre: string;
  telefono?: string;
  email?: string;
  empresa?: string;
  created_at: string;
  updated_at: string;
}

export const useProveedores = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProveedores = async () => {
    try {
      const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .order('nombre');
      
      if (error) throw error;
      setProveedores(data || []);
    } catch (error) {
      console.error('Error fetching proveedores:', error);
      toast.error('Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  const createProveedor = async (proveedor: Omit<Proveedor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('proveedores')
        .insert([proveedor]);
      
      if (error) throw error;
      
      toast.success('Proveedor creado exitosamente');
      await fetchProveedores();
    } catch (error) {
      console.error('Error creating proveedor:', error);
      toast.error('Error al crear proveedor');
      throw error;
    }
  };

  const updateProveedor = async (id: string, updates: Partial<Omit<Proveedor, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { error } = await supabase
        .from('proveedores')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Proveedor actualizado exitosamente');
      await fetchProveedores();
    } catch (error) {
      console.error('Error updating proveedor:', error);
      toast.error('Error al actualizar proveedor');
      throw error;
    }
  };

  const deleteProveedor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('proveedores')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Proveedor eliminado exitosamente');
      await fetchProveedores();
    } catch (error) {
      console.error('Error deleting proveedor:', error);
      toast.error('Error al eliminar proveedor');
      throw error;
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  return {
    proveedores,
    loading,
    createProveedor,
    updateProveedor,
    deleteProveedor,
    refetch: fetchProveedores
  };
};