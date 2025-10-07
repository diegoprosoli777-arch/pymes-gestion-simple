import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

export interface Venta {
  id: string;
  fecha: string;
  cliente_id?: string;
  monto_total: number;
  descuento?: number;
  impuesto?: number;
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia';
  estado: 'cobrada' | 'pendiente';
  fecha_cobro?: string;
  fecha_vencimiento?: string;
  created_at: string;
  updated_at: string;
}

export interface VentaItem {
  id: string;
  venta_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  created_at: string;
}

export interface VentaWithDetails extends Venta {
  cliente?: {
    nombre: string;
    empresa?: string;
  };
  items?: (VentaItem & {
    producto: {
      nombre: string;
    };
  })[];
}

export const useVentas = () => {
  const [ventas, setVentas] = useState<VentaWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVentas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('ventas')
        .select(`
          *,
          cliente:clientes(nombre, empresa),
          items:ventas_items(
            id,
            venta_id,
            producto_id,
            cantidad,
            precio_unitario,
            created_at,
            producto:productos(nombre)
          )
        `)
        .eq('user_id', user.id)
        .order('fecha', { ascending: false });
      
      if (error) throw error;
      setVentas((data || []) as VentaWithDetails[]);
    } catch (error) {
      console.error('Error fetching ventas:', error);
      toast.error('Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  };

  const createVenta = async (
    venta: Omit<Venta, 'id' | 'created_at' | 'updated_at'>,
    items: Omit<VentaItem, 'id' | 'venta_id' | 'created_at'>[]
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Create venta
      const { data: ventaData, error: ventaError } = await supabase
        .from('ventas')
        .insert([{ ...venta, user_id: user.id }])
        .select()
        .single();
      
      if (ventaError) throw ventaError;

      // Create venta items
      if (items.length > 0) {
        const ventaItems = items.map(item => ({
          ...item,
          venta_id: ventaData.id
        }));

        const { error: itemsError } = await supabase
          .from('ventas_items')
          .insert(ventaItems);
        
        if (itemsError) throw itemsError;

        // Update product stock
        for (const item of items) {
          const { data: productoData } = await supabase
            .from('productos')
            .select('stock_actual')
            .eq('id', item.producto_id)
            .single();
          
          if (productoData) {
            const newStock = productoData.stock_actual - item.cantidad;
            await supabase
              .from('productos')
              .update({ stock_actual: newStock })
              .eq('id', item.producto_id);
          }
        }
      }
      
      toast.success('Venta creada exitosamente');
      await fetchVentas();
      return ventaData;
    } catch (error) {
      console.error('Error creating venta:', error);
      toast.error('Error al crear venta');
      throw error;
    }
  };

  const updateVentaEstado = async (id: string, estado: 'cobrada' | 'pendiente') => {
    try {
      const { error } = await supabase
        .from('ventas')
        .update({ estado })
        .eq('id', id);
      
      if (error) throw error;
      
      setVentas(prev => prev.map(v => v.id === id ? { ...v, estado } : v));
      toast.success('Estado de venta actualizado');
    } catch (error) {
      console.error('Error updating venta estado:', error);
      toast.error('Error al actualizar estado');
      throw error;
    }
  };

  useEffect(() => {
    fetchVentas();
  }, []);

  return {
    ventas,
    loading,
    createVenta,
    updateVentaEstado,
    refetch: fetchVentas
  };
};