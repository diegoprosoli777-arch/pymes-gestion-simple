import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Calculator, 
  FileText, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Download,
  Plus,
  Clock
} from "lucide-react";
import { useTributaria } from "@/hooks/useTributaria";
import toast from "react-hot-toast";

export default function Tributaria() {
  const { vencimientos, reportesFiscales, loading, completarVencimiento, crearVencimiento, exportarReporteFiscal } = useTributaria();
  const [isCreatingVencimiento, setIsCreatingVencimiento] = useState(false);
  
  const [newVencimiento, setNewVencimiento] = useState({
    nombre: '',
    descripcion: '',
    fecha_vencimiento: '',
    tipo: 'mensual' as 'mensual' | 'anual' | 'trimestral',
    monto_estimado: 0,
    notas: ''
  });

  if (loading) {
    return <div className="p-6">Cargando información tributaria...</div>;
  }

  const handleCreateVencimiento = async () => {
    if (!newVencimiento.nombre || !newVencimiento.fecha_vencimiento) {
      toast.error('Complete los campos obligatorios');
      return;
    }

    await crearVencimiento(newVencimiento);
    
    setNewVencimiento({
      nombre: '',
      descripcion: '',
      fecha_vencimiento: '',
      tipo: 'mensual',
      monto_estimado: 0,
      notas: ''
    });
    setIsCreatingVencimiento(false);
  };

  const exportarReporteCompleto = () => {
    // Preparar datos completos para Excel
    const data = [
      ['REPORTE FISCAL COMPLETO'],
      ['Generado el:', new Date().toLocaleDateString()],
      [''],
      ['PERIODO', 'VENTAS TOTALES', 'IVA VENTAS', 'COMPRAS TOTALES', 'IVA COMPRAS', 'IVA RESULTANTE', 'BALANCE NETO'],
    ];

    reportesFiscales.forEach(reporte => {
      data.push([
        reporte.periodo,
        reporte.ventasTotales.toString(),
        reporte.ivaVentas.toString(),
        reporte.comprasTotales.toString(),
        reporte.ivaCompras.toString(),
        reporte.ivaResultante.toString(),
        reporte.balanceNeto.toString()
      ]);
    });

    // Exportar usando la librería xlsx
    import('xlsx').then(XLSX => {
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Reporte Fiscal Completo');
      XLSX.writeFile(wb, `reporte-fiscal-completo-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Reporte fiscal completo exportado');
    });
  };

  // Filtrar vencimientos próximos (próximos 30 días)
  const vencimientosProximos = vencimientos.filter(v => {
    if (v.completado) return false;
    const fechaVenc = new Date(v.fecha_vencimiento);
    const hoy = new Date();
    const diferenciaDias = (fechaVenc.getTime() - hoy.getTime()) / (1000 * 3600 * 24);
    return diferenciaDias <= 30 && diferenciaDias >= 0;
  });

  const vencimientosVencidos = vencimientos.filter(v => {
    if (v.completado) return false;
    const fechaVenc = new Date(v.fecha_vencimiento);
    const hoy = new Date();
    return fechaVenc < hoy;
  });

  const getVencimientoStatus = (vencimiento: any) => {
    if (vencimiento.completado) return { color: 'bg-green-100 text-green-800', label: 'Completado' };
    
    const fechaVenc = new Date(vencimiento.fecha_vencimiento);
    const hoy = new Date();
    const diferenciaDias = (fechaVenc.getTime() - hoy.getTime()) / (1000 * 3600 * 24);
    
    if (diferenciaDias < 0) return { color: 'bg-red-100 text-red-800', label: 'Vencido' };
    if (diferenciaDias <= 7) return { color: 'bg-orange-100 text-orange-800', label: 'Próximo a vencer' };
    if (diferenciaDias <= 30) return { color: 'bg-yellow-100 text-yellow-800', label: 'Próximo' };
    return { color: 'bg-gray-100 text-gray-800', label: 'Pendiente' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión Tributaria y Fiscal</h1>
          <p className="text-muted-foreground mt-2">
            Reportes fiscales, vencimientos impositivos y exportaciones
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={isCreatingVencimiento} onOpenChange={setIsCreatingVencimiento}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Vencimiento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Vencimiento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nombre del vencimiento (ej: IVA Marzo)"
                  value={newVencimiento.nombre}
                  onChange={(e) => setNewVencimiento({...newVencimiento, nombre: e.target.value})}
                />
                
                <Textarea
                  placeholder="Descripción"
                  value={newVencimiento.descripcion}
                  onChange={(e) => setNewVencimiento({...newVencimiento, descripcion: e.target.value})}
                />
                
                <Input
                  type="date"
                  value={newVencimiento.fecha_vencimiento}
                  onChange={(e) => setNewVencimiento({...newVencimiento, fecha_vencimiento: e.target.value})}
                />
                
                <Select value={newVencimiento.tipo} onValueChange={(value: any) => setNewVencimiento({...newVencimiento, tipo: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensual">Mensual</SelectItem>
                    <SelectItem value="trimestral">Trimestral</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  type="number"
                  placeholder="Monto estimado"
                  value={newVencimiento.monto_estimado || ''}
                  onChange={(e) => setNewVencimiento({...newVencimiento, monto_estimado: Number(e.target.value)})}
                />
                
                <Textarea
                  placeholder="Notas adicionales"
                  value={newVencimiento.notas}
                  onChange={(e) => setNewVencimiento({...newVencimiento, notas: e.target.value})}
                />
                
                <Button onClick={handleCreateVencimiento} className="w-full">Crear Vencimiento</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={exportarReporteCompleto}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Todo
          </Button>
        </div>
      </div>

      {/* Alertas de Vencimientos */}
      {(vencimientosVencidos.length > 0 || vencimientosProximos.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vencimientosVencidos.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Vencimientos Overdue ({vencimientosVencidos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {vencimientosVencidos.slice(0, 3).map((vencimiento) => (
                    <div key={vencimiento.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{vencimiento.nombre}</p>
                        <p className="text-xs text-red-600">
                          Venció: {new Date(vencimiento.fecha_vencimiento).toLocaleDateString()}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => completarVencimiento(vencimiento.id)}>
                        Completar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {vencimientosProximos.length > 0 && (
            <Card className="border-yellow-200">
              <CardHeader>
                <CardTitle className="text-yellow-600 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Próximos Vencimientos ({vencimientosProximos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {vencimientosProximos.slice(0, 3).map((vencimiento) => (
                    <div key={vencimiento.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{vencimiento.nombre}</p>
                        <p className="text-xs text-yellow-600">
                          Vence: {new Date(vencimiento.fecha_vencimiento).toLocaleDateString()}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => completarVencimiento(vencimiento.id)}>
                        Completar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Reportes Fiscales Mensuales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Reportes Fiscales Simplificados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Período</th>
                  <th className="text-right py-2">Ventas Totales</th>
                  <th className="text-right py-2">IVA Ventas</th>
                  <th className="text-right py-2">Compras Totales</th>
                  <th className="text-right py-2">IVA Compras</th>
                  <th className="text-right py-2">IVA Resultante</th>
                  <th className="text-right py-2">Balance Neto</th>
                  <th className="text-center py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reportesFiscales.map((reporte) => (
                  <tr key={reporte.periodo} className="border-b hover:bg-muted/50">
                    <td className="py-3 font-medium">{reporte.periodo}</td>
                    <td className="text-right py-3">${reporte.ventasTotales.toLocaleString()}</td>
                    <td className="text-right py-3">${reporte.ivaVentas.toLocaleString()}</td>
                    <td className="text-right py-3">${reporte.comprasTotales.toLocaleString()}</td>
                    <td className="text-right py-3">${reporte.ivaCompras.toLocaleString()}</td>
                    <td className={`text-right py-3 font-medium ${reporte.ivaResultante >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${reporte.ivaResultante.toLocaleString()}
                    </td>
                    <td className={`text-right py-3 font-medium ${reporte.balanceNeto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${reporte.balanceNeto.toLocaleString()}
                    </td>
                    <td className="text-center py-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => exportarReporteFiscal(reporte.periodo)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Lista Completa de Vencimientos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Calendario de Vencimientos Impositivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {vencimientos.map((vencimiento) => {
              const status = getVencimientoStatus(vencimiento);
              return (
                <div key={vencimiento.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h4 className="font-medium">{vencimiento.nombre}</h4>
                        <p className="text-sm text-muted-foreground">{vencimiento.descripcion}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-muted-foreground">
                            Vence: {new Date(vencimiento.fecha_vencimiento).toLocaleDateString()}
                          </span>
                          <Badge variant="secondary">{vencimiento.tipo}</Badge>
                          <Badge className={status.color}>{status.label}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold">${vencimiento.monto_estimado.toLocaleString()}</p>
                    {!vencimiento.completado && (
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={() => completarVencimiento(vencimiento.id)}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completar
                      </Button>
                    )}
                    {vencimiento.completado && vencimiento.fecha_completado && (
                      <p className="text-sm text-green-600">
                        Completado: {new Date(vencimiento.fecha_completado).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resumen Fiscal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">IVA Resultante Total</p>
                <p className={`text-2xl font-bold ${reportesFiscales.reduce((sum, r) => sum + r.ivaResultante, 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${reportesFiscales.reduce((sum, r) => sum + r.ivaResultante, 0).toLocaleString()}
                </p>
              </div>
              <Calculator className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vencimientos Pendientes</p>
                <p className="text-2xl font-bold text-warning">
                  {vencimientos.filter(v => !v.completado).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monto Total Estimado</p>
                <p className="text-2xl font-bold text-primary">
                  ${vencimientos.filter(v => !v.completado).reduce((sum, v) => sum + v.monto_estimado, 0).toLocaleString()}
                </p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}