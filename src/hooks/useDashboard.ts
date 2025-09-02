import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardKPIs {
  ventasDelMes: number;
  ventasMesAnterior: number;
  ticketPromedio: number;
  clientesActivos: number;
  productosEnStock: number;
  productosStockBajo: number;
  facturasCobradasPorcentaje: number;
  balanceDelMes: number;
  topProductos: Array<{
    nombre: string;
    ventas: number;
    revenue: number;
  }>;
  topClientes: Array<{
    nombre: string;
    revenue: number;
    ordenes: number;
  }>;
  stockCritico: Array<{
    nombre: string;
    stock_actual: number;
    stock_minimo: number;
  }>;
}

export const useDashboard = () => {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getFullYear() + '-' + String(currentDate.getMonth() + 1).padStart(2, '0');
      const previousMonth = currentDate.getFullYear() + '-' + String(currentDate.getMonth()).padStart(2, '0');

      // Ventas del mes actual
      const { data: ventasActuales, error: ventasError } = await supabase
        .from('ventas')
        .select('monto_total, estado')
        .gte('fecha', currentMonth + '-01')
        .lte('fecha', currentMonth + '-31');

      if (ventasError) {
        console.error('Error fetching ventas actuales:', ventasError);
      }

      // Ventas del mes anterior  
      const { data: ventasAnteriores, error: ventasAnterioresError } = await supabase
        .from('ventas')
        .select('monto_total')
        .gte('fecha', previousMonth + '-01')
        .lte('fecha', previousMonth + '-31');

      if (ventasAnterioresError) {
        console.error('Error fetching ventas anteriores:', ventasAnterioresError);
      }

      // Clientes activos
      const { count: clientesActivos, error: clientesError } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'activo');

      if (clientesError) {
        console.error('Error fetching clientes:', clientesError);
      }

      // Productos y stock
      const { data: productos, error: productosError } = await supabase
        .from('productos')
        .select('stock_actual, stock_minimo, nombre');

      if (productosError) {
        console.error('Error fetching productos:', productosError);
      }

      // Top productos vendidos (últimos 30 días)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const { data: topProductosData, error: topProductosError } = await supabase
        .from('ventas_items')
        .select(`
          cantidad,
          precio_unitario,
          producto:productos(nombre),
          venta:ventas(fecha)
        `)
        .gte('venta.fecha', thirtyDaysAgo);

      if (topProductosError) {
        console.error('Error fetching top productos:', topProductosError);
      }

      // Top clientes por facturación (últimos 90 días)
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const { data: topClientesData, error: topClientesError } = await supabase
        .from('ventas')
        .select(`
          monto_total,
          cliente:clientes(nombre)
        `)
        .not('cliente_id', 'is', null)
        .gte('fecha', ninetyDaysAgo);

      if (topClientesError) {
        console.error('Error fetching top clientes:', topClientesError);
      }

      // Gastos del mes
      const { data: gastos, error: gastosError } = await supabase
        .from('gastos')
        .select('monto')
        .gte('fecha', currentMonth + '-01')
        .lte('fecha', currentMonth + '-31');

      if (gastosError) {
        console.error('Error fetching gastos:', gastosError);
      }

      // Procesar datos
      const ventasDelMes = ventasActuales?.reduce((sum, v) => sum + Number(v.monto_total), 0) || 0;
      const ventasMesAnterior = ventasAnteriores?.reduce((sum, v) => sum + Number(v.monto_total), 0) || 0;
      const ticketPromedio = ventasActuales?.length ? ventasDelMes / ventasActuales.length : 0;
      const gastosDelMes = gastos?.reduce((sum, g) => sum + Number(g.monto), 0) || 0;
      const balanceDelMes = ventasDelMes - gastosDelMes;

      const productosStockBajo = productos?.filter(p => p.stock_actual <= p.stock_minimo).length || 0;
      const stockCritico = productos?.filter(p => p.stock_actual <= p.stock_minimo).slice(0, 5) || [];

      const facturasCobradasPorcentaje = ventasActuales?.length 
        ? (ventasActuales.filter(v => v.estado === 'cobrada').length / ventasActuales.length) * 100 
        : 0;

      // Procesar top productos
      const productosVentas = topProductosData?.reduce((acc: any, item: any) => {
        const nombre = item.producto?.nombre;
        if (!nombre) return acc;
        
        if (!acc[nombre]) {
          acc[nombre] = { nombre, ventas: 0, revenue: 0 };
        }
        acc[nombre].ventas += item.cantidad;
        acc[nombre].revenue += item.cantidad * Number(item.precio_unitario);
        return acc;
      }, {});

      const topProductos = Object.values(productosVentas || {})
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 5);

      // Procesar top clientes
      const clientesVentas = topClientesData?.reduce((acc: any, venta: any) => {
        const nombre = venta.cliente?.nombre;
        if (!nombre) return acc;
        
        if (!acc[nombre]) {
          acc[nombre] = { nombre, revenue: 0, ordenes: 0 };
        }
        acc[nombre].revenue += Number(venta.monto_total);
        acc[nombre].ordenes += 1;
        return acc;
      }, {});

      const topClientes = Object.values(clientesVentas || {})
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 5);

      setKpis({
        ventasDelMes,
        ventasMesAnterior,
        ticketPromedio,
        clientesActivos: clientesActivos || 0,
        productosEnStock: productos?.length || 0,
        productosStockBajo,
        facturasCobradasPorcentaje,
        balanceDelMes,
        topProductos: topProductos as any,
        topClientes: topClientes as any,
        stockCritico: stockCritico as any
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    kpis,
    loading,
    refetch: fetchDashboardData
  };
};