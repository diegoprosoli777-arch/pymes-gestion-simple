import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

export interface Producto {
  id: string;
  nombre: string;
  costo: number;
  precio: number;
  stock_actual: number;
  stock_minimo: number;
  categoria: string;
  created_at: string;
  updated_at: string;
}

export const useProductos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProductos = async () => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('nombre');
      
      if (error) throw error;
      setProductos(data || []);
    } catch (error) {
      console.error('Error fetching productos:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const createProducto = async (producto: Omit<Producto, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .insert([producto])
        .select()
        .single();
      
      if (error) throw error;
      
      setProductos(prev => [...prev, data]);
      toast.success('Producto creado exitosamente');
      return data;
    } catch (error) {
      console.error('Error creating producto:', error);
      toast.error('Error al crear producto');
      throw error;
    }
  };

  const updateProducto = async (id: string, updates: Partial<Producto>) => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setProductos(prev => prev.map(p => p.id === id ? data : p));
      toast.success('Producto actualizado exitosamente');
      return data;
    } catch (error) {
      console.error('Error updating producto:', error);
      toast.error('Error al actualizar producto');
      throw error;
    }
  };

  const deleteProducto = async (id: string) => {
    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setProductos(prev => prev.filter(p => p.id !== id));
      toast.success('Producto eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting producto:', error);
      toast.error('Error al eliminar producto');
      throw error;
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  return {
    productos,
    loading,
    createProducto,
    updateProducto,
    deleteProducto,
    refetch: fetchProductos
  };
};