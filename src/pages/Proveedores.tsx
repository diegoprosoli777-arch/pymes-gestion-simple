import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProveedorForm } from '@/components/Forms/ProveedorForm';
import { CompraProveedorForm } from '@/components/Forms/CompraProveedorForm';
import { PagoProveedorForm } from '@/components/Forms/PagoProveedorForm';
import { useProveedores } from '@/hooks/useProveedores';
import { Search, Plus, Edit, Trash2, ShoppingCart, CreditCard, Eye, MapPin, Building, Phone, Mail, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

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

  const [searchTerm, setSearchTerm] = useState('');
  const [rubroFilter, setRubroFilter] = useState('');
  const [ciudadFilter, setCiudadFilter] = useState('');
  const [showProveedorForm, setShowProveedorForm] = useState(false);
  const [showCompraForm, setShowCompraForm] = useState(false);
  const [showPagoForm, setShowPagoForm] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState(null);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [selectedProveedorDetail, setSelectedProveedorDetail] = useState(null);

  // Get unique rubros and ciudades for filters
  const uniqueRubros = useMemo(() => {
    const rubros = new Set(proveedores.map(p => p.rubro).filter(Boolean));
    return Array.from(rubros).sort();
  }, [proveedores]);

  const uniqueCiudades = useMemo(() => {
    const ciudades = new Set(proveedores.map(p => p.ciudad).filter(Boolean));
    return Array.from(ciudades).sort();
  }, [proveedores]);

  // Filtered proveedores
  const filteredProveedores = useMemo(() => {
    return proveedores.filter(proveedor => {
      const matchesSearch = searchTerm === '' || 
        proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proveedor.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proveedor.cuit_dni?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRubro = rubroFilter === '' || proveedor.rubro === rubroFilter;
      const matchesCiudad = ciudadFilter === '' || proveedor.ciudad === ciudadFilter;
      
      return matchesSearch && matchesRubro && matchesCiudad;
    });
  }, [proveedores, searchTerm, rubroFilter, ciudadFilter]);

  const handleEditProveedor = (proveedor) => {
    setEditingProveedor(proveedor);
    setShowProveedorForm(true);
  };

  const handleDeleteProveedor = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este proveedor?')) {
      await deleteProveedor(id);
    }
  };

  const handleCreateProveedor = async (data) => {
    await createProveedor(data);
    setShowProveedorForm(false);
    setEditingProveedor(null);
  };

  const handleUpdateProveedor = async (data) => {
    if (editingProveedor) {
      await updateProveedor(editingProveedor.id, data);
      setShowProveedorForm(false);
      setEditingProveedor(null);
    }
  };

  const viewProveedorDetail = (proveedor) => {
    setSelectedProveedorDetail(proveedor);
    fetchCompras(proveedor.id);
    fetchPagos(proveedor.id);
  };

  const exportProveedorHistory = (proveedor) => {
    const proveedorCompras = compras.filter(c => c.proveedor_id === proveedor.id);
    
    const wb = XLSX.utils.book_new();
    const comprasData = [
      ['Fecha', 'Concepto', 'Monto Total', 'Estado']
    ];
    
    proveedorCompras.forEach(compra => {
      comprasData.push([compra.fecha, compra.concepto, compra.monto_total.toString(), compra.estado]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(comprasData);
    XLSX.utils.book_append_sheet(wb, ws, 'Compras');
    
    XLSX.writeFile(wb, `historial_${proveedor.nombre.replace(/\s+/g, '_')}.xlsx`);
    toast.success('Historial exportado exitosamente');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando proveedores...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Proveedores</h1>
        <Button onClick={() => setShowProveedorForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar por nombre, empresa o CUIT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={rubroFilter} onValueChange={setRubroFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por rubro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los rubros</SelectItem>
                {uniqueRubros.map(rubro => (
                  <SelectItem key={rubro} value={rubro}>{rubro}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={ciudadFilter} onValueChange={setCiudadFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por ciudad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las ciudades</SelectItem>
                {uniqueCiudades.map(ciudad => (
                  <SelectItem key={ciudad} value={ciudad}>{ciudad}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setRubroFilter('');
              setCiudadFilter('');
            }}>
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Proveedores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProveedores.map((proveedor) => (
          <Card key={proveedor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{proveedor.nombre}</CardTitle>
                  {proveedor.empresa && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Building className="w-3 h-3" />
                      {proveedor.empresa}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEditProveedor(proveedor)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteProveedor(proveedor.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {proveedor.cuit_dni && (
                <div className="text-sm">
                  <strong>CUIT/DNI:</strong> {proveedor.cuit_dni}
                </div>
              )}
              
              {proveedor.rubro && (
                <div>
                  <Badge variant="secondary">{proveedor.rubro}</Badge>
                </div>
              )}
              
              <div className="space-y-1">
                {proveedor.telefono && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-3 h-3" />
                    {proveedor.telefono}
                  </div>
                )}
                {proveedor.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-3 h-3" />
                    {proveedor.email}
                  </div>
                )}
                {(proveedor.ciudad || proveedor.provincia) && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-3 h-3" />
                    {[proveedor.ciudad, proveedor.provincia].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => viewProveedorDetail(proveedor)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver Detalle
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportProveedorHistory(proveedor)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Provider Detail Dialog */}
      {selectedProveedorDetail && (
        <Dialog open={!!selectedProveedorDetail} onOpenChange={() => setSelectedProveedorDetail(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalle de {selectedProveedorDetail.nombre}</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="compras">Compras</TabsTrigger>
                <TabsTrigger value="pagos">Pagos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">Información General</h4>
                    <p><strong>Nombre:</strong> {selectedProveedorDetail.nombre}</p>
                    {selectedProveedorDetail.empresa && <p><strong>Empresa:</strong> {selectedProveedorDetail.empresa}</p>}
                    {selectedProveedorDetail.cuit_dni && <p><strong>CUIT/DNI:</strong> {selectedProveedorDetail.cuit_dni}</p>}
                    {selectedProveedorDetail.rubro && <p><strong>Rubro:</strong> {selectedProveedorDetail.rubro}</p>}
                  </div>
                  <div>
                    <h4 className="font-semibold">Contacto</h4>
                    {selectedProveedorDetail.telefono && <p><strong>Teléfono:</strong> {selectedProveedorDetail.telefono}</p>}
                    {selectedProveedorDetail.email && <p><strong>Email:</strong> {selectedProveedorDetail.email}</p>}
                    {selectedProveedorDetail.direccion && <p><strong>Dirección:</strong> {selectedProveedorDetail.direccion}</p>}
                    {(selectedProveedorDetail.ciudad || selectedProveedorDetail.provincia) && (
                      <p><strong>Ciudad:</strong> {[selectedProveedorDetail.ciudad, selectedProveedorDetail.provincia].filter(Boolean).join(', ')}</p>
                    )}
                  </div>
                </div>
                {selectedProveedorDetail.notas && (
                  <div>
                    <h4 className="font-semibold">Notas</h4>
                    <p className="text-sm text-muted-foreground">{selectedProveedorDetail.notas}</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="compras">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Historial de Compras</h4>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setSelectedProveedor(selectedProveedorDetail.id);
                        setShowCompraForm(true);
                      }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Nueva Compra
                    </Button>
                  </div>
                  
                  {compras.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Concepto</TableHead>
                          <TableHead>Monto</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {compras.map((compra) => (
                          <TableRow key={compra.id}>
                            <TableCell>{compra.fecha}</TableCell>
                            <TableCell>{compra.concepto}</TableCell>
                            <TableCell>${Number(compra.monto_total).toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant={
                                compra.estado === 'pagada' ? 'default' : 
                                compra.estado === 'vencida' ? 'destructive' : 'secondary'
                              }>
                                {compra.estado}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={compra.estado}
                                onValueChange={(estado) => updateCompraEstado(compra.id, estado as 'pendiente' | 'pagada' | 'vencida')}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pendiente">Pendiente</SelectItem>
                                  <SelectItem value="pagada">Pagada</SelectItem>
                                  <SelectItem value="vencida">Vencida</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground">No hay compras registradas para este proveedor.</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="pagos">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Historial de Pagos</h4>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setSelectedProveedor(selectedProveedorDetail.id);
                        setShowPagoForm(true);
                      }}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Nuevo Pago
                    </Button>
                  </div>
                  
                  {pagos.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Concepto</TableHead>
                          <TableHead>Monto</TableHead>
                          <TableHead>Método</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pagos.map((pago) => (
                          <TableRow key={pago.id}>
                            <TableCell>{pago.fecha}</TableCell>
                            <TableCell>{pago.concepto || 'Pago general'}</TableCell>
                            <TableCell>${Number(pago.monto).toLocaleString()}</TableCell>
                            <TableCell>{pago.metodo_pago}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground">No hay pagos registrados para este proveedor.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Forms */}
      <ProveedorForm
        isOpen={showProveedorForm}
        onClose={() => {
          setShowProveedorForm(false);
          setEditingProveedor(null);
        }}
        onSubmit={editingProveedor ? handleUpdateProveedor : handleCreateProveedor}
        title={editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        initialData={editingProveedor}
      />

      <CompraProveedorForm
        isOpen={showCompraForm}
        onClose={() => {
          setShowCompraForm(false);
          setSelectedProveedor(null);
        }}
        onSubmit={createCompra}
        proveedorId={selectedProveedor || ''}
      />

      <PagoProveedorForm
        isOpen={showPagoForm}
        onClose={() => {
          setShowPagoForm(false);
          setSelectedProveedor(null);
        }}
        onSubmit={createPago}
        proveedorId={selectedProveedor || ''}
      />
    </div>
  );
}