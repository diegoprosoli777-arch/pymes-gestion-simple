import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';

export interface VencimientoImpositivo {
  id: string;
  nombre: string;
  descripcion?: string;
  fecha_vencimiento: string;
  tipo: 'mensual' | 'anual' | 'trimestral';
  monto_estimado: number;
  completado: boolean;
  fecha_completado?: string;
  notas?: string;
}

export interface ReporteFiscal {
  periodo: string;
  ivaVentas: number;
  ivaCompras: number;
  ivaResultante: number;
  ventasTotales: number;
  comprasTotales: number;
  balanceNeto: number;
}

export const useTributaria = () => {
  const [vencimientos, setVencimientos] = useState<VencimientoImpositivo[]>([]);
  const [reportesFiscales, setReportesFiscales] = useState<ReporteFiscal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVencimientos = async () => {
    try {
      const { data, error } = await supabase
        .from('vencimientos_impositivos')
        .select('*')
        .order('fecha_vencimiento', { ascending: true });
      
      if (error) throw error;
      setVencimientos(data as VencimientoImpositivo[] || []);
    } catch (error) {
      console.error('Error fetching vencimientos:', error);
      toast.error('Error al cargar vencimientos impositivos');
    }
  };

  const generarReportesFiscales = async () => {
    try {
      // Obtener datos de los últimos 12 meses
      const fechaInicio = new Date();
      fechaInicio.setMonth(fechaInicio.getMonth() - 12);

      const { data: ventas, error: ventasError } = await supabase
        .from('ventas')
        .select('fecha, monto_total, impuesto')
        .gte('fecha', fechaInicio.toISOString().split('T')[0]);
      
      if (ventasError) throw ventasError;

      const { data: gastos, error: gastosError } = await supabase
        .from('gastos')
        .select('fecha, monto, categoria_fiscal')
        .gte('fecha', fechaInicio.toISOString().split('T')[0]);
      
      if (gastosError) throw gastosError;

      // Agrupar por mes y calcular reportes fiscales
      const reportesPorMes: { [key: string]: ReporteFiscal } = {};
      
      ventas?.forEach(venta => {
        const periodo = venta.fecha.substring(0, 7); // YYYY-MM
        if (!reportesPorMes[periodo]) {
          reportesPorMes[periodo] = {
            periodo,
            ivaVentas: 0,
            ivaCompras: 0,
            ivaResultante: 0,
            ventasTotales: 0,
            comprasTotales: 0,
            balanceNeto: 0
          };
        }
        
        const montoTotal = Number(venta.monto_total);
        const impuesto = Number(venta.impuesto || 0);
        
        reportesPorMes[periodo].ventasTotales += montoTotal;
        reportesPorMes[periodo].ivaVentas += impuesto;
      });

      gastos?.forEach(gasto => {
        const periodo = gasto.fecha.substring(0, 7);
        if (!reportesPorMes[periodo]) {
          reportesPorMes[periodo] = {
            periodo,
            ivaVentas: 0,
            ivaCompras: 0,
            ivaResultante: 0,
            ventasTotales: 0,
            comprasTotales: 0,
            balanceNeto: 0
          };
        }
        
        const monto = Number(gasto.monto);
        // Calcular IVA sobre compras (21% estimado)
        const ivaCompra = monto * 0.21;
        
        reportesPorMes[periodo].comprasTotales += monto;
        reportesPorMes[periodo].ivaCompras += ivaCompra;
      });

      // Calcular IVA resultante y balance neto
      Object.values(reportesPorMes).forEach(reporte => {
        reporte.ivaResultante = reporte.ivaVentas - reporte.ivaCompras;
        reporte.balanceNeto = reporte.ventasTotales - reporte.comprasTotales;
      });

      const reportesArray = Object.values(reportesPorMes)
        .sort((a, b) => b.periodo.localeCompare(a.periodo));

      setReportesFiscales(reportesArray);
    } catch (error) {
      console.error('Error generating fiscal reports:', error);
      toast.error('Error al generar reportes fiscales');
    }
  };

  const completarVencimiento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vencimientos_impositivos')
        .update({ 
          completado: true,
          fecha_completado: new Date().toISOString().split('T')[0]
        })
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchVencimientos();
      toast.success('Vencimiento marcado como completado');
    } catch (error) {
      console.error('Error completing vencimiento:', error);
      toast.error('Error al completar vencimiento');
    }
  };

  const crearVencimiento = async (vencimiento: Omit<VencimientoImpositivo, 'id' | 'completado'>) => {
    try {
      const { error } = await supabase
        .from('vencimientos_impositivos')
        .insert([vencimiento]);
      
      if (error) throw error;
      
      await fetchVencimientos();
      toast.success('Vencimiento creado correctamente');
    } catch (error) {
      console.error('Error creating vencimiento:', error);
      toast.error('Error al crear vencimiento');
    }
  };

  const exportarReporteFiscal = (periodo: string) => {
    const reporte = reportesFiscales.find(r => r.periodo === periodo);
    if (!reporte) {
      toast.error('Reporte no encontrado');
      return;
    }

    // Preparar datos para Excel
    const data = [
      ['REPORTE FISCAL', periodo],
      ['', ''],
      ['CONCEPTO', 'MONTO'],
      ['Ventas Totales', reporte.ventasTotales],
      ['IVA Ventas (21%)', reporte.ivaVentas],
      ['Compras Totales', reporte.comprasTotales],
      ['IVA Compras (21%)', reporte.ivaCompras],
      ['IVA Resultante', reporte.ivaResultante],
      ['Balance Neto', reporte.balanceNeto],
    ];

    // Crear archivo Excel usando la librería xlsx
    import('xlsx').then(XLSX => {
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Reporte Fiscal');
      XLSX.writeFile(wb, `reporte-fiscal-${periodo}.xlsx`);
      toast.success('Reporte fiscal exportado correctamente');
    });
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchVencimientos(),
        generarReportesFiscales()
      ]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  return {
    vencimientos,
    reportesFiscales,
    loading,
    completarVencimiento,
    crearVencimiento,
    exportarReporteFiscal,
    refetch: () => Promise.all([fetchVencimientos(), generarReportesFiscales()])
  };
};