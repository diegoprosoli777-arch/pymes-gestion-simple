import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';

export interface FlujoCajaData {
  mes: string;
  ingresos: number;
  egresos: number;
  balance: number;
  acumulado: number;
}

export interface KPIFinanciero {
  diasPromedioCobro: number;
  diasPromedioPago: number;
  liquidezActual: number;
  rotacionCuentasCobrar: number;
  ventasPorCobrar: number;
  gastosPorPagar: number;
}

export const useFinanciamiento = () => {
  const [flujoCaja, setFlujoCaja] = useState<FlujoCajaData[]>([]);
  const [kpisFinancieros, setKpisFinancieros] = useState<KPIFinanciero | null>(null);
  const [loading, setLoading] = useState(true);

  const calcularFlujoCaja = async () => {
    try {
      // Obtener datos de ventas por mes (últimos 12 meses)
      const fechaInicio = new Date();
      fechaInicio.setMonth(fechaInicio.getMonth() - 12);
      
      const { data: ventas, error: ventasError } = await supabase
        .from('ventas')
        .select('fecha, monto_total, fecha_cobro')
        .gte('fecha', fechaInicio.toISOString().split('T')[0]);
      
      if (ventasError) throw ventasError;

      const { data: gastos, error: gastosError } = await supabase
        .from('gastos')
        .select('fecha, monto')
        .gte('fecha', fechaInicio.toISOString().split('T')[0]);
      
      if (gastosError) throw gastosError;

      // Agrupar por mes
      const flujoMensual: { [key: string]: { ingresos: number; egresos: number } } = {};
      
      ventas?.forEach(venta => {
        const mes = venta.fecha.substring(0, 7); // YYYY-MM
        if (!flujoMensual[mes]) {
          flujoMensual[mes] = { ingresos: 0, egresos: 0 };
        }
        flujoMensual[mes].ingresos += Number(venta.monto_total);
      });

      gastos?.forEach(gasto => {
        const mes = gasto.fecha.substring(0, 7);
        if (!flujoMensual[mes]) {
          flujoMensual[mes] = { ingresos: 0, egresos: 0 };
        }
        flujoMensual[mes].egresos += Number(gasto.monto);
      });

      // Convertir a array y calcular acumulado
      let acumulado = 0;
      const flujoCajaArray = Object.entries(flujoMensual)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([mes, datos]) => {
          const balance = datos.ingresos - datos.egresos;
          acumulado += balance;
          return {
            mes,
            ingresos: datos.ingresos,
            egresos: datos.egresos,
            balance,
            acumulado
          };
        });

      setFlujoCaja(flujoCajaArray);
    } catch (error) {
      console.error('Error calculating cash flow:', error);
      toast.error('Error al calcular flujo de caja');
    }
  };

  const calcularKPIsFinancieros = async () => {
    try {
      // Ventas últimos 30 días
      const fecha30Dias = new Date();
      fecha30Dias.setDate(fecha30Dias.getDate() - 30);

      const { data: ventasRecientes, error: ventasError } = await supabase
        .from('ventas')
        .select('fecha, monto_total, fecha_cobro, estado')
        .gte('fecha', fecha30Dias.toISOString().split('T')[0]);
      
      if (ventasError) throw ventasError;

      // Gastos últimos 30 días
      const { data: gastosRecientes, error: gastosError } = await supabase
        .from('gastos')
        .select('fecha, monto')
        .gte('fecha', fecha30Dias.toISOString().split('T')[0]);
      
      if (gastosError) throw gastosError;

      // Calcular días promedio de cobro
      const ventasCobradas = ventasRecientes?.filter(v => v.fecha_cobro) || [];
      let totalDiasCobro = 0;
      ventasCobradas.forEach(venta => {
        if (venta.fecha_cobro) {
          const fechaVenta = new Date(venta.fecha);
          const fechaCobro = new Date(venta.fecha_cobro);
          const dias = (fechaCobro.getTime() - fechaVenta.getTime()) / (1000 * 3600 * 24);
          totalDiasCobro += dias;
        }
      });
      const diasPromedioCobro = ventasCobradas.length > 0 ? totalDiasCobro / ventasCobradas.length : 0;

      // Calcular otros KPIs
      const ventasPorCobrar = ventasRecientes?.filter(v => v.estado === 'pendiente')
        .reduce((sum, v) => sum + Number(v.monto_total), 0) || 0;
      
      const totalIngresos = ventasRecientes?.reduce((sum, v) => sum + Number(v.monto_total), 0) || 0;
      const totalEgresos = gastosRecientes?.reduce((sum, g) => sum + Number(g.monto), 0) || 0;
      
      const liquidezActual = totalIngresos > 0 ? (totalIngresos - totalEgresos) / totalIngresos : 0;

      setKpisFinancieros({
        diasPromedioCobro: Math.round(diasPromedioCobro),
        diasPromedioPago: 15, // Simplificado por ahora
        liquidezActual: liquidezActual * 100,
        rotacionCuentasCobrar: ventasCobradas.length,
        ventasPorCobrar,
        gastosPorPagar: totalEgresos * 0.3 // Estimado
      });

    } catch (error) {
      console.error('Error calculating financial KPIs:', error);
      toast.error('Error al calcular KPIs financieros');
    }
  };

  const generarSugerenciasOptimizacion = () => {
    if (!kpisFinancieros) return [];

    const sugerencias = [];
    
    if (kpisFinancieros.diasPromedioCobro > 30) {
      sugerencias.push({
        tipo: 'warning',
        titulo: 'Reducir días de cobro',
        descripcion: `Sus clientes están pagando en ${kpisFinancieros.diasPromedioCobro} días promedio. Considere ofrecer descuentos por pronto pago.`
      });
    }

    if (kpisFinancieros.liquidezActual < 20) {
      sugerencias.push({
        tipo: 'danger',
        titulo: 'Mejorar liquidez',
        descripcion: 'Su liquidez actual es baja. Revise gastos no esenciales y acelere cobros.'
      });
    }

    if (kpisFinancieros.ventasPorCobrar > 50000) {
      sugerencias.push({
        tipo: 'info',
        titulo: 'Gestión de cobranzas',
        descripcion: `Tiene $${kpisFinancieros.ventasPorCobrar.toLocaleString()} pendientes de cobro. Implemente recordatorios automáticos.`
      });
    }

    return sugerencias;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        calcularFlujoCaja(),
        calcularKPIsFinancieros()
      ]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  return {
    flujoCaja,
    kpisFinancieros,
    loading,
    sugerencias: generarSugerenciasOptimizacion(),
    refetch: () => Promise.all([calcularFlujoCaja(), calcularKPIsFinancieros()])
  };
};