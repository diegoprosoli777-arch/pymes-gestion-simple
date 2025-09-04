import { useState, useEffect } from "react";
import { Plus, Search, Building, Mail, Phone, Edit, Trash2, ShoppingCart, CreditCard, Eye, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useProveedores, Proveedor } from "@/hooks/useProveedores";
import { ProveedorForm } from "@/components/Forms/ProveedorForm";
import { CompraProveedorForm } from "@/components/Forms/CompraProveedorForm";
import { PagoProveedorForm } from "@/components/Forms/PagoProveedorForm";
import toast from "react-hot-toast";

export default function Proveedores() {
  const { 
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
    fetchPagos
  } = useProveedores();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);
  const [viewingProveedor, setViewingProveedor] = useState<Proveedor | null>(null);
  const [isCompraFormOpen, setIsCompraFormOpen] = useState(false);
  const [isPagoFormOpen, setIsPagoFormOpen] = useState(false);

  if (loading) {
    return <div className="p-6">Cargando proveedores...</div>;
  }

  const filteredProveedores = proveedores.filter(proveedor =>
    proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proveedor.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proveedor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (proveedor: Proveedor) => {
    setEditingProveedor(proveedor);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProveedor(null);
  };

  const handleSubmit = async (data: Omit<Proveedor, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingProveedor) {
      await updateProveedor(editingProveedor.id, data);
    } else {
      await createProveedor(data);
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    try {
      await deleteProveedor(id);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleView = (proveedor: Proveedor) => {
    setViewingProveedor(proveedor);
    fetchCompras(proveedor.id);
    fetchPagos(proveedor.id);
  };

  const handleCompraSubmit = async (data: any) => {
    await createCompra(data);
    if (viewingProveedor) {
      fetchCompras(viewingProveedor.id);
    }
  };

  const handlePagoSubmit = async (data: any) => {
    await createPago(data);
    if (viewingProveedor) {
      fetchPagos(viewingProveedor.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pagada':
        return 'bg-success text-success-foreground';
      case 'vencida':
        return 'bg-destructive text-destructive-foreground';
      case 'pendiente':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
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

  // Calcular estadísticas del proveedor
  const getProveedorStats = (proveedorId: string) => {
    const proveedorCompras = compras.filter(c => c.proveedor_id === proveedorId);
    const proveedorPagos = pagos.filter(p => p.proveedor_id === proveedorId);
    
    const totalCompras = proveedorCompras.reduce((sum, c) => sum + c.monto_total, 0);
    const totalPagos = proveedorPagos.reduce((sum, p) => sum + p.monto, 0);
    const saldo = totalCompras - totalPagos;
    
    return { totalCompras, totalPagos, saldo, cantidadCompras: proveedorCompras.length };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Proveedores</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona los proveedores de tu negocio
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Proveedor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}</DialogTitle>
            </DialogHeader>
            <ProveedorForm
              isOpen={isFormOpen}
              onClose={handleCloseForm}
              onSubmit={handleSubmit}
              title={editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              initialData={editingProveedor || undefined}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Proveedores</p>
                <p className="text-2xl font-bold">{proveedores.length}</p>
              </div>
              <Building className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Con Email</p>
                <p className="text-2xl font-bold text-success">
                  {proveedores.filter(p => p.email).length}
                </p>
              </div>
              <Mail className="h-8 w-8 text-success" />
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
                placeholder="Buscar por nombre, empresa o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Proveedores */}
      <div className="grid gap-4">
        {filteredProveedores.map((proveedor) => (
          <Card key={proveedor.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-center">
                <div className="lg:col-span-2">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{proveedor.nombre}</h3>
                      <p className="text-sm text-muted-foreground">
                        {proveedor.empresa || 'Sin empresa'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center lg:text-left">
                  {proveedor.email ? (
                    <div className="flex items-center space-x-2 lg:justify-start justify-center">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{proveedor.email}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Sin email</span>
                  )}
                </div>
                
                <div className="text-center lg:text-left">
                  {proveedor.telefono ? (
                    <div className="flex items-center space-x-2 lg:justify-start justify-center">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{proveedor.telefono}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Sin teléfono</span>
                  )}
                  {proveedor.especialidad && (
                    <p className="text-xs text-muted-foreground mt-1">{proveedor.especialidad}</p>
                  )}
                </div>
                
                <div className="text-center lg:text-left">
                  <div className="text-sm">
                    <p className="font-medium">${getProveedorStats(proveedor.id).totalCompras.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total compras</p>
                  </div>
                </div>
                
                <div className="text-center flex space-x-2 justify-center lg:justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleView(proveedor)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(proveedor)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminará permanentemente el proveedor "{proveedor.nombre}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(proveedor.id, proveedor.nombre)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProveedores.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron proveedores</h3>
            <p className="text-muted-foreground">
              Intenta cambiar los términos de búsqueda o registra un nuevo proveedor.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog para ver detalles del proveedor */}
      <Dialog open={!!viewingProveedor} onOpenChange={() => setViewingProveedor(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Proveedor</DialogTitle>
          </DialogHeader>
          {viewingProveedor && (
            <div className="space-y-6">
              {/* Información del proveedor */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>{viewingProveedor.nombre}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium">Empresa</p>
                      <p className="text-sm text-muted-foreground">{viewingProveedor.empresa || 'No especificada'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Especialidad</p>
                      <p className="text-sm text-muted-foreground">{viewingProveedor.especialidad || 'No especificada'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{viewingProveedor.email || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Teléfono</p>
                      <p className="text-sm text-muted-foreground">{viewingProveedor.telefono || 'No especificado'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Compras</p>
                        <p className="text-lg font-bold">${getProveedorStats(viewingProveedor.id).totalCompras.toLocaleString()}</p>
                      </div>
                      <ShoppingCart className="h-6 w-6 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Pagos</p>
                        <p className="text-lg font-bold text-success">${getProveedorStats(viewingProveedor.id).totalPagos.toLocaleString()}</p>
                      </div>
                      <DollarSign className="h-6 w-6 text-success" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Saldo Pendiente</p>
                        <p className="text-lg font-bold text-warning">${getProveedorStats(viewingProveedor.id).saldo.toLocaleString()}</p>
                      </div>
                      <CreditCard className="h-6 w-6 text-warning" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Cantidad Compras</p>
                        <p className="text-lg font-bold">{getProveedorStats(viewingProveedor.id).cantidadCompras}</p>
                      </div>
                      <Building className="h-6 w-6 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs para historial */}
              <Tabs defaultValue="compras" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="compras">Historial de Compras</TabsTrigger>
                  <TabsTrigger value="pagos">Historial de Pagos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="compras" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Compras</h3>
                    <Button onClick={() => setIsCompraFormOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Compra
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {compras.filter(c => c.proveedor_id === viewingProveedor.id).map((compra) => (
                      <Card key={compra.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{compra.concepto}</h4>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(compra.fecha)} - {compra.numero_factura && `Factura: ${compra.numero_factura}`}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">${compra.monto_total.toLocaleString()}</p>
                              <Badge 
                                className={getStatusColor(compra.estado)}
                                onClick={() => updateCompraEstado(compra.id, compra.estado === 'pagada' ? 'pendiente' : 'pagada')}
                                style={{ cursor: 'pointer' }}
                              >
                                {compra.estado === 'pagada' ? 'Pagada' : compra.estado === 'vencida' ? 'Vencida' : 'Pendiente'}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="pagos" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Pagos</h3>
                    <Button onClick={() => setIsPagoFormOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Pago
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {pagos.filter(p => p.proveedor_id === viewingProveedor.id).map((pago) => (
                      <Card key={pago.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{pago.concepto || 'Pago'}</h4>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(pago.fecha)} - {pago.metodo_pago} 
                                {pago.numero_referencia && ` - Ref: ${pago.numero_referencia}`}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-success">${pago.monto.toLocaleString()}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Formularios */}
      {viewingProveedor && (
        <>
          <CompraProveedorForm
            isOpen={isCompraFormOpen}
            onClose={() => setIsCompraFormOpen(false)}
            onSubmit={handleCompraSubmit}
            proveedorId={viewingProveedor.id}
          />
          
          <PagoProveedorForm
            isOpen={isPagoFormOpen}
            onClose={() => setIsPagoFormOpen(false)}
            onSubmit={handlePagoSubmit}
            proveedorId={viewingProveedor.id}
          />
        </>
      )}
    </div>
  );
}