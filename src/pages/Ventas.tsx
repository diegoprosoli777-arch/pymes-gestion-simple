import { useState } from "react";
import { Plus, Search, ShoppingCart, Calendar, DollarSign, Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useVentas } from "@/hooks/useVentas";
import { VentaForm } from "@/components/Forms/VentaForm";
import { exportVentasReport } from "@/lib/excel";
import toast from "react-hot-toast";

export default function Ventas() {
  const { ventas, loading, updateVentaEstado } = useVentas();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingVenta, setViewingVenta] = useState<any>(null);

  if (loading) {
    return <div className="p-6">Cargando ventas...</div>;
  }

  const filteredVentas = ventas.filter(venta =>
    venta.cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venta.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (venta: any) => {
    setViewingVenta(venta);
  };

  const handleStatusChange = async (id: string, estado: 'cobrada' | 'pendiente') => {
    await updateVentaEstado(id, estado);
  };

  const handleExport = () => {
    // Necesitamos obtener los items de ventas y productos para el reporte
    exportVentasReport(ventas, [], [], []);
    toast.success('Reporte de ventas exportado');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cobrada':
        return 'bg-success text-success-foreground';
      case 'pendiente':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'efectivo':
        return 'Efectivo';
      case 'tarjeta':
        return 'Tarjeta';
      case 'transferencia':
        return 'Transferencia';
      default:
        return method;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const totalVentas = filteredVentas.reduce((sum, venta) => sum + venta.monto_total, 0);
  const ventasCobradas = filteredVentas.filter(venta => venta.estado === 'cobrada').length;
  const ventasPendientes = filteredVentas.filter(venta => venta.estado === 'pendiente').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ventas</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona las ventas de tu negocio
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExport}>
            Exportar Excel
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Venta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva Venta</DialogTitle>
              </DialogHeader>
              <VentaForm onClose={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Ventas</p>
                <p className="text-2xl font-bold">${totalVentas.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Órdenes</p>
                <p className="text-2xl font-bold">{filteredVentas.length}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cobradas</p>
                <p className="text-2xl font-bold text-success">{ventasCobradas}</p>
              </div>
              <div className="bg-success/10 p-2 rounded-lg">
                <span className="text-success text-sm font-medium">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-warning">{ventasPendientes}</p>
              </div>
              <div className="bg-warning/10 p-2 rounded-lg">
                <span className="text-warning text-sm font-medium">⏱</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por cliente o número de venta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Ventas */}
      <div className="grid gap-4">
        {filteredVentas.map((venta) => (
          <Card key={venta.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                <div className="lg:col-span-2">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Venta #{venta.id.slice(-8)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {venta.cliente?.nombre || 'Cliente no especificado'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center lg:text-left">
                  <div className="flex items-center space-x-2 lg:justify-start justify-center">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formatDate(venta.fecha)}</span>
                  </div>
                </div>
                
                <div className="text-center lg:text-left">
                  <p className="text-sm text-muted-foreground">Monto</p>
                  <p className="text-xl font-bold text-success">${venta.monto_total.toLocaleString()}</p>
                </div>
                
                <div className="text-center lg:text-left">
                  <p className="text-sm text-muted-foreground">{getPaymentMethodLabel(venta.metodo_pago)}</p>
                  <p className="text-sm">{venta.items?.length || 0} productos</p>
                </div>
                
                <div className="text-center lg:text-left">
                  <Badge 
                    className={getStatusColor(venta.estado)}
                    onClick={() => handleStatusChange(venta.id, venta.estado === 'cobrada' ? 'pendiente' : 'cobrada')}
                    style={{ cursor: 'pointer' }}
                  >
                    {venta.estado === 'cobrada' ? 'Cobrada' : 'Pendiente'}
                  </Badge>
                </div>
                
                <div className="text-center flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleView(venta)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para ver detalles de la venta */}
      <Dialog open={!!viewingVenta} onOpenChange={() => setViewingVenta(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la Venta</DialogTitle>
          </DialogHeader>
          {viewingVenta && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">Venta #{viewingVenta.id.slice(-8)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {viewingVenta.cliente?.nombre || 'Cliente no especificado'}
                  </p>
                </div>
                <Badge className={getStatusColor(viewingVenta.estado)}>
                  {viewingVenta.estado === 'cobrada' ? 'Cobrada' : 'Pendiente'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Fecha</label>
                  <p className="text-sm">{formatDate(viewingVenta.fecha)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Monto Total</label>
                  <p className="text-sm font-bold">${viewingVenta.monto_total.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Método de Pago</label>
                  <p className="text-sm">{getPaymentMethodLabel(viewingVenta.metodo_pago)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <p className="text-sm">{viewingVenta.estado === 'cobrada' ? 'Cobrada' : 'Pendiente'}</p>
                </div>
              </div>
              
              {viewingVenta.items && viewingVenta.items.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Productos</label>
                  <div className="mt-2 space-y-2">
                    {viewingVenta.items.map((item: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                        <span className="font-medium">{item.producto?.nombre}</span>
                        <span className="text-muted-foreground ml-2">
                          {item.cantidad} x ${item.precio_unitario} = ${(item.cantidad * item.precio_unitario).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {filteredVentas.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron ventas</h3>
            <p className="text-muted-foreground">
              Intenta cambiar los términos de búsqueda o registra una nueva venta.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}