import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';

export interface PresupuestoMensual {
  id: string;
  año: number;
  mes: number;
  ingresos_esperados: number;
  gastos_esperados: number;
  objetivo_ventas: number;
  notas?: string;
}

export interface ComparacionPlanReal {
  periodo: string;
  planificado: {
    ingresos: number;
    gastos: number;
    balance: number;
  };
  real: {
    ingresos: number;
    gastos: number;
    balance: number;
  };
  desviacion: {
    ingresos: number;
    gastos: number;
    balance: number;
    porcentaje: number;
  };
}

export const usePlanificacion = () => {
  const [presupuestos, setPresupuestos] = useState<PresupuestoMensual[]>([]);
  const [comparaciones, setComparaciones] = useState<ComparacionPlanReal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPresupuestos = async () => {
    try {
      const { data, error } = await supabase
        .from('presupuestos_mensuales')
        .select('*')
        .order('año', { ascending: false })
        .order('mes', { ascending: false });
      
      if (error) throw error;
      setPresupuestos(data || []);
    } catch (error) {
      console.error('Error fetching presupuestos:', error);
      toast.error('Error al cargar presupuestos');
    }
  };

  const generarComparacionPlanReal = async () => {
    try {
      // Obtener presupuestos de los últimos 6 meses
      const fechaInicio = new Date();
      fechaInicio.setMonth(fechaInicio.getMonth() - 6);

      const { data: presupuestosData, error: presupuestosError } = await supabase
        .from('presupuestos_mensuales')
        .select('*')
        .gte('año', fechaInicio.getFullYear())
        .order('año', { ascending: true })
        .order('mes', { ascending: true });
      
      if (presupuestosError) throw presupuestosError;

      // Obtener datos reales de ventas y gastos
      const { data: ventas, error: ventasError } = await supabase
        .from('ventas')
        .select('fecha, monto_total')
        .gte('fecha', fechaInicio.toISOString().split('T')[0]);
      
      if (ventasError) throw ventasError;

      const { data: gastos, error: gastosError } = await supabase
        .from('gastos')
        .select('fecha, monto')
        .gte('fecha', fechaInicio.toISOString().split('T')[0]);
      
      if (gastosError) throw gastosError;

      // Agrupar datos reales por mes
      const datosReales: { [key: string]: { ingresos: number; gastos: number } } = {};
      
      ventas?.forEach(venta => {
        const key = `${new Date(venta.fecha).getFullYear()}-${String(new Date(venta.fecha).getMonth() + 1).padStart(2, '0')}`;
        if (!datosReales[key]) {
          datosReales[key] = { ingresos: 0, gastos: 0 };
        }
        datosReales[key].ingresos += Number(venta.monto_total);
      });

      gastos?.forEach(gasto => {
        const key = `${new Date(gasto.fecha).getFullYear()}-${String(new Date(gasto.fecha).getMonth() + 1).padStart(2, '0')}`;
        if (!datosReales[key]) {
          datosReales[key] = { ingresos: 0, gastos: 0 };
        }
        datosReales[key].gastos += Number(gasto.monto);
      });

      // Generar comparaciones
      const comparacionesArray: ComparacionPlanReal[] = [];
      
      presupuestosData?.forEach(presupuesto => {
        const key = `${presupuesto.año}-${String(presupuesto.mes).padStart(2, '0')}`;
        const real = datosReales[key] || { ingresos: 0, gastos: 0 };
        
        const planificado = {
          ingresos: Number(presupuesto.ingresos_esperados),
          gastos: Number(presupuesto.gastos_esperados),
          balance: Number(presupuesto.ingresos_esperados) - Number(presupuesto.gastos_esperados)
        };

        const realData = {
          ingresos: real.ingresos,
          gastos: real.gastos,
          balance: real.ingresos - real.gastos
        };

        const desviacion = {
          ingresos: realData.ingresos - planificado.ingresos,
          gastos: realData.gastos - planificado.gastos,
          balance: realData.balance - planificado.balance,
          porcentaje: planificado.balance !== 0 
            ? ((realData.balance - planificado.balance) / Math.abs(planificado.balance)) * 100 
            : 0
        };

        comparacionesArray.push({
          periodo: key,
          planificado,
          real: realData,
          desviacion
        });
      });

      setComparaciones(comparacionesArray.sort((a, b) => b.periodo.localeCompare(a.periodo)));
    } catch (error) {
      console.error('Error generating plan vs real comparison:', error);
      toast.error('Error al generar comparación plan vs real');
    }
  };

  const crearPresupuesto = async (presupuesto: Omit<PresupuestoMensual, 'id'>) => {
    try {
      const { error } = await supabase
        .from('presupuestos_mensuales')
        .insert([presupuesto]);
      
      if (error) throw error;
      
      await fetchPresupuestos();
      await generarComparacionPlanReal();
      toast.success('Presupuesto creado correctamente');
    } catch (error) {
      console.error('Error creating presupuesto:', error);
      toast.error('Error al crear presupuesto');
    }
  };

  const actualizarPresupuesto = async (id: string, datos: Partial<PresupuestoMensual>) => {
    try {
      const { error } = await supabase
        .from('presupuestos_mensuales')
        .update(datos)
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchPresupuestos();
      await generarComparacionPlanReal();
      toast.success('Presupuesto actualizado correctamente');
    } catch (error) {
      console.error('Error updating presupuesto:', error);
      toast.error('Error al actualizar presupuesto');
    }
  };

  const eliminarPresupuesto = async (id: string) => {
    try {
      const { error } = await supabase
        .from('presupuestos_mensuales')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchPresupuestos();
      toast.success('Presupuesto eliminado correctamente');
    } catch (error) {
      console.error('Error deleting presupuesto:', error);
      toast.error('Error al eliminar presupuesto');
    }
  };

  const generarAlertas = () => {
    const alertas = [];
    
    comparaciones.forEach(comp => {
      if (Math.abs(comp.desviacion.porcentaje) > 20) {
        alertas.push({
          periodo: comp.periodo,
          tipo: comp.desviacion.porcentaje > 0 ? 'success' : 'warning',
          mensaje: comp.desviacion.porcentaje > 0 
            ? `Superó el plan en ${comp.desviacion.porcentaje.toFixed(1)}%`
            : `Por debajo del plan en ${Math.abs(comp.desviacion.porcentaje).toFixed(1)}%`
        });
      }
    });

    return alertas;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPresupuestos(),
        generarComparacionPlanReal()
      ]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  return {
    presupuestos,
    comparaciones,
    alertas: generarAlertas(),
    loading,
    crearPresupuesto,
    actualizarPresupuesto,
    eliminarPresupuesto,
    refetch: () => Promise.all([fetchPresupuestos(), generarComparacionPlanReal()])
  };
};