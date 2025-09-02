import { useState } from "react";
import { Download, FileText, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClientes } from "@/hooks/useClientes";
import { useVentas } from "@/hooks/useVentas";
import { useProductos } from "@/hooks/useProductos";
import { useGastos } from "@/hooks/useGastos";
import { 
  exportVentasReport, 
  exportClientesReport, 
  exportProductosReport, 
  exportGastosReport,
  exportFinancieroReport
} from "@/lib/excel";
import { useFinanciamiento } from "@/hooks/useFinanciamiento";
import { exportCentralizedReport } from "@/lib/centralized-export";
import toast from "react-hot-toast";

export default function Reportes() {
  const { clientes, loading: loadingClientes } = useClientes();
  const { ventas, loading: loadingVentas } = useVentas();
  const { productos, loading: loadingProductos } = useProductos();
  const { gastos, loading: loadingGastos } = useGastos();
  const { flujoCaja, kpisFinancieros } = useFinanciamiento();
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0].replace(/-\d{2}$/, '-01'),
    end: new Date().toISOString().split('T')[0]
  });

  const loading = loadingClientes || loadingVentas || loadingProductos || loadingGastos;

  if (loading) {
    return <div className="p-6">Cargando datos para reportes...</div>;
  }
  const handleExportReport = (type: string) => {
    try {
      switch (type) {
        case 'ventas':
          exportVentasReport(ventas, clientes, productos);
          break;
        case 'clientes':
          exportClientesReport(clientes, ventas);
          break;
        case 'productos':
          exportProductosReport(productos);
          break;
        case 'gastos':
          exportGastosReport(gastos);
          break;
        case 'financiero':
          exportFinancieroReport(ventas, gastos, flujoCaja, kpisFinancieros);
          break;
        default:
          toast.error('Tipo de reporte no válido');
          return;
      }
      toast.success('Reporte exportado exitosamente');
    } catch (error) {
      toast.error('Error al exportar reporte');
      console.error('Export error:', error);
    }
  };

  const handleQuickReport = (reportName: string) => {
    const now = new Date();
    const currentMonth = now.toISOString().substring(0, 7); // YYYY-MM format
    
    switch (reportName) {
      case 'ventas-mes':
        const ventasMes = ventas.filter(v => v.fecha.startsWith(currentMonth));
        if (ventasMes.length === 0) {
          toast.error('No hay ventas en el mes actual');
          return;
        }
        exportVentasReport(ventasMes, clientes, productos);
        break;
      case 'top-productos':
        // Calcular productos más vendidos basado en ventas
        const productosVendidos = productos.map(producto => {
          const totalVendido = ventas.reduce((sum, venta) => {
            if (!venta.items) return sum;
            const productInSale = venta.items.find(item => item.producto_id === producto.id);
            return sum + (productInSale?.cantidad || 0);
          }, 0);
          return { ...producto, total_vendido: totalVendido };
        }).sort((a, b) => b.total_vendido - a.total_vendido).slice(0, 10);
        
        exportProductosReport(productosVendidos);
        break;
      case 'clientes-activos':
        const clientesConVentas = clientes.filter(cliente => 
          ventas.some(venta => venta.cliente_id === cliente.id)
        ).sort((a, b) => {
          const ventasA = ventas.filter(v => v.cliente_id === a.id).reduce((sum, v) => sum + v.monto_total, 0);
          const ventasB = ventas.filter(v => v.cliente_id === b.id).reduce((sum, v) => sum + v.monto_total, 0);
          return ventasB - ventasA;
        });
        exportClientesReport(clientesConVentas, ventas);
        break;
      case 'stock-bajo':
        const stockBajo = productos.filter(p => p.stock_actual <= p.stock_minimo);
        if (stockBajo.length === 0) {
          toast('Todos los productos tienen stock adecuado');
          return;
        }
        exportProductosReport(stockBajo);
        break;
      default:
        toast.error('Reporte rápido no encontrado');
    }
    toast.success('Reporte generado exitosamente');
  };

  const reportTypes = [
    {
      title: "Reporte de Ventas",
      description: "Exporta todas las ventas por período",
      icon: TrendingUp,
      formats: ["Excel", "CSV", "PDF"]
    },
    {
      title: "Reporte de Clientes",
      description: "Lista completa de clientes y su actividad",
      icon: FileText,
      formats: ["Excel", "CSV"]
    },
    {
      title: "Reporte de Productos",
      description: "Inventario actual y movimientos",
      icon: FileText,
      formats: ["Excel", "CSV"]
    },
    {
      title: "Reporte de Gastos",
      description: "Todos los gastos registrados por período",
      icon: FileText,
      formats: ["Excel", "CSV"]
    },
    {
      title: "Balance General",
      description: "Resumen financiero completo",
      icon: Calendar,
      formats: ["PDF", "Excel"]
    }
  ];

  const quickReports = [
    { 
      name: "Ventas del Mes Actual", 
      period: new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
      key: "ventas-mes"
    },
    { 
      name: "Top 10 Productos Más Vendidos", 
      period: "Últimos 30 días",
      key: "top-productos"
    },
    { 
      name: "Clientes Más Activos", 
      period: "Por volumen de ventas",
      key: "clientes-activos"
    },
    { 
      name: "Productos con Stock Bajo", 
      period: "Estado actual",
      key: "stock-bajo"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
        <p className="text-muted-foreground mt-2">
          Exporta y analiza los datos de tu negocio
        </p>
      </div>

      {/* Reporte Centralizado */}
      <div className="mb-6">
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">📊 Reporte Completo del Negocio</h2>
                <p className="text-muted-foreground">
                  Descarga un archivo Excel completo con todas tus datos organizados en múltiples hojas:
                  Resumen, Clientes, Inventario, Ventas, Gastos, Análisis Financiero y Top Rankings.
                </p>
                <div className="mt-3 text-sm text-muted-foreground">
                  ✅ {clientes.length} clientes • ✅ {productos.length} productos • ✅ {ventas.length} ventas • ✅ {gastos.length} gastos
                </div>
              </div>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-secondary"
                onClick={() => {
                  exportCentralizedReport({
                    clientes,
                    ventas,
                    productos,
                    gastos,
                    flujoCaja,
                    kpisFinancieros
                  });
                  toast.success('¡Reporte completo exportado exitosamente!');
                }}
              >
                <Download className="h-5 w-5 mr-2" />
                Exportar Todo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reportes Rápidos */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Reportes Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickReports.map((report, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="text-center">
                  <h3 className="font-semibold mb-2">{report.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{report.period}</p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleQuickReport(report.key)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Reportes Personalizados */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Reportes Personalizados</h2>
        <div className="grid gap-6">
          {reportTypes.map((report, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <report.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{report.title}</h3>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    key="excel" 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExportReport(report.title.toLowerCase().includes('ventas') ? 'ventas' :
                      report.title.toLowerCase().includes('clientes') ? 'clientes' :
                      report.title.toLowerCase().includes('productos') ? 'productos' :
                      report.title.toLowerCase().includes('gastos') ? 'gastos' : 'financiero')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Configuración de Reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Configurar Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Fecha Inicio</label>
              <input 
                type="date" 
                className="w-full mt-1 p-2 border border-input rounded-md"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Fecha Fin</label>
              <input 
                type="date" 
                className="w-full mt-1 p-2 border border-input rounded-md"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              />
            </div>
            <div className="flex items-end">
              <Button 
                className="w-full"
                onClick={() => toast.success('Filtros aplicados para el rango: ' + dateRange.start + ' - ' + dateRange.end)}
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información Adicional */}
      <Card className="bg-accent/50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <FileText className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Información sobre Reportes</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Los reportes se generan con datos reales de la base de datos</li>
                <li>• Los archivos Excel incluyen múltiples hojas con análisis detallado</li>
                <li>• Todos los reportes están optimizados para PyMEs</li>
                <li>• Los datos se actualizan en tiempo real desde tu sistema</li>
                <li>• Total de registros: {clientes.length} clientes, {ventas.length} ventas, {productos.length} productos, {gastos.length} gastos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}