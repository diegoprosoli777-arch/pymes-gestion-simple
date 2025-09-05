import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

export interface Proveedor {
  id: string;
  nombre: string;
  cuit_dni?: string;
  telefono?: string;
  email?: string;
  empresa?: string;
  especialidad?: string;
  tipo_proveedor?: string;
  rubro?: string;
  activo?: boolean;
  direccion?: string;
  calle?: string;
  numero?: string;
  ciudad?: string;
  provincia?: string;
  codigo_postal?: string;
  notas?: string;
  notas_internas?: string;
  created_at: string;
  updated_at: string;
}

export interface CompraProveedor {
  id: string;
  proveedor_id: string;
  fecha: string;
  numero_factura?: string;
  concepto: string;
  monto_total: number;
  estado: 'pendiente' | 'pagada' | 'vencida';
  fecha_vencimiento?: string;
  fecha_pago?: string;
  metodo_pago?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export interface PagoProveedor {
  id: string;
  proveedor_id: string;
  compra_id?: string;
  fecha: string;
  monto: number;
  metodo_pago: string;
  numero_referencia?: string;
  concepto?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export const useProveedores = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [compras, setCompras] = useState<CompraProveedor[]>([]);
  const [pagos, setPagos] = useState<PagoProveedor[]>([]);
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

  // Compras functions
  const fetchCompras = async (proveedorId?: string) => {
    try {
      let query = supabase
        .from('compras_proveedores')
        .select('*')
        .order('fecha', { ascending: false });
      
      if (proveedorId) {
        query = query.eq('proveedor_id', proveedorId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setCompras((data || []) as CompraProveedor[]);
    } catch (error) {
      console.error('Error fetching compras:', error);
      toast.error('Error al cargar compras');
    }
  };

  const createCompra = async (compra: Omit<CompraProveedor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('compras_proveedores')
        .insert([compra]);
      
      if (error) throw error;
      
      toast.success('Compra registrada exitosamente');
      await fetchCompras();
    } catch (error) {
      console.error('Error creating compra:', error);
      toast.error('Error al registrar compra');
      throw error;
    }
  };

  const updateCompraEstado = async (id: string, estado: 'pendiente' | 'pagada' | 'vencida') => {
    try {
      const updateData: any = { estado };
      if (estado === 'pagada') {
        updateData.fecha_pago = new Date().toISOString().split('T')[0];
      }
      
      const { error } = await supabase
        .from('compras_proveedores')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Estado de compra actualizado');
      await fetchCompras();
    } catch (error) {
      console.error('Error updating compra estado:', error);
      toast.error('Error al actualizar estado');
      throw error;
    }
  };

  // Pagos functions
  const fetchPagos = async (proveedorId?: string) => {
    try {
      let query = supabase
        .from('pagos_proveedores')
        .select('*')
        .order('fecha', { ascending: false });
      
      if (proveedorId) {
        query = query.eq('proveedor_id', proveedorId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setPagos((data || []) as PagoProveedor[]);
    } catch (error) {
      console.error('Error fetching pagos:', error);
      toast.error('Error al cargar pagos');
    }
  };

  const createPago = async (pago: Omit<PagoProveedor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('pagos_proveedores')
        .insert([pago]);
      
      if (error) throw error;
      
      toast.success('Pago registrado exitosamente');
      await fetchPagos();
    } catch (error) {
      console.error('Error creating pago:', error);
      toast.error('Error al registrar pago');
      throw error;
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  return {
    proveedores,
    compras,
    pagos,
    loading,
    createProveedor,
    updateProveedor,
    deleteProveedor,
    createCompra,
    updateCompraEstado,
    fetchCompras,
    createPago,
    fetchPagos,
    refetch: fetchProveedores
  };
};