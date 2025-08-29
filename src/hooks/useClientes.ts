import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

export interface Cliente {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  empresa?: string;
  estado: 'prospecto' | 'activo' | 'inactivo';
  notas?: string;
  created_at: string;
  updated_at: string;
}

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nombre');
      
      if (error) throw error;
      setClientes((data || []) as Cliente[]);
    } catch (error) {
      console.error('Error fetching clientes:', error);
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const createCliente = async (cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([cliente])
        .select()
        .single();
      
      if (error) throw error;
      
      setClientes(prev => [...prev, data as Cliente]);
      toast.success('Cliente creado exitosamente');
      return data;
    } catch (error) {
      console.error('Error creating cliente:', error);
      toast.error('Error al crear cliente');
      throw error;
    }
  };

  const updateCliente = async (id: string, updates: Partial<Cliente>) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setClientes(prev => prev.map(c => c.id === id ? data as Cliente : c));
      toast.success('Cliente actualizado exitosamente');
      return data;
    } catch (error) {
      console.error('Error updating cliente:', error);
      toast.error('Error al actualizar cliente');
      throw error;
    }
  };

  const deleteCliente = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setClientes(prev => prev.filter(c => c.id !== id));
      toast.success('Cliente eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting cliente:', error);
      toast.error('Error al eliminar cliente');
      throw error;
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return {
    clientes,
    loading,
    createCliente,
    updateCliente,
    deleteCliente,
    refetch: fetchClientes
  };
};