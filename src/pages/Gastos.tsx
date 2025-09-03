import { useState } from "react";
import { Plus, Search, Receipt, Calendar, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useGastos } from "@/hooks/useGastos";
import { useDashboard } from "@/hooks/useDashboard";
import { GastoForm } from "@/components/Forms/GastoForm";
import { exportToExcel } from "@/lib/excel";
import toast from "react-hot-toast";

export default function Gastos() {
  const { gastos, loading, deleteGasto, createGasto, updateGasto } = useGastos();
  const { refetch: refetchDashboard } = useDashboard();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGasto, setEditingGasto] = useState<any>(null);

  if (loading) {
    return <div className="p-6">Cargando gastos...</div>;
  }

  const filteredGastos = gastos.filter(gasto =>
    gasto.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (gasto.notas && gasto.notas.toLowerCase().includes(searchTerm.toLowerCase())) ||
    gasto.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (gasto: any) => {
    setEditingGasto(gasto);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este gasto?')) {
      await deleteGasto(id);
      // Refrescar dashboard después de eliminar gasto
      refetchDashboard();
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingGasto(null);
  };

  const handleExport = () => {
    const reportData = gastos.map(gasto => ({
      Fecha: gasto.fecha,
      Proveedor: gasto.proveedor,
      Monto: gasto.monto,
      Tipo: gasto.tipo,
      'Categoría Fiscal': gasto.categoria_fiscal,
      Notas: gasto.notas || ''
    }));
    exportToExcel(reportData, 'reporte-gastos', 'Gastos');
    toast.success('Reporte de gastos exportado');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'operativo':
        return 'bg-primary/10 text-primary';
      case 'insumo':
        return 'bg-success/10 text-success';
      case 'otro':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'operativo':
        return 'Operativo';
      case 'insumo':
        return 'Insumo';
      case 'otro':
        return 'Otro';
      default:
        return type;
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

  const totalGastos = filteredGastos.reduce((sum, gasto) => sum + gasto.monto, 0);
  const gastosPorTipo = {
    operativo: filteredGastos.filter(g => g.tipo === 'operativo').reduce((sum, g) => sum + g.monto, 0),
    insumo: filteredGastos.filter(g => g.tipo === 'insumo').reduce((sum, g) => sum + g.monto, 0),
    otro: filteredGastos.filter(g => g.tipo === 'otro').reduce((sum, g) => sum + g.monto, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gastos</h1>
          <p className="text-muted-foreground mt-2">
            Controla los gastos de tu negocio
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
                Nuevo Gasto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingGasto ? 'Editar Gasto' : 'Nuevo Gasto'}
                </DialogTitle>
              </DialogHeader>
              <GastoForm
                isOpen={isFormOpen}
                onClose={() => {
                  handleCloseForm();
                  refetchDashboard(); // Refrescar dashboard al crear/editar gasto
                }}
                onSubmit={editingGasto ? 
                  (data) => updateGasto(editingGasto.id, data) :
                  createGasto
                }
                initialData={editingGasto}
                title={editingGasto ? 'Editar Gasto' : 'Nuevo Gasto'}
              />
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
                <p className="text-sm text-muted-foreground">Total Gastos</p>
                <p className="text-2xl font-bold text-danger">${totalGastos.toLocaleString()}</p>
              </div>
              <Receipt className="h-8 w-8 text-danger" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Operativos</p>
                <p className="text-2xl font-bold text-primary">${gastosPorTipo.operativo.toLocaleString()}</p>
              </div>
              <div className="bg-primary/10 p-2 rounded-lg">
                <span className="text-primary text-sm font-medium">OP</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Insumos</p>
                <p className="text-2xl font-bold text-success">${gastosPorTipo.insumo.toLocaleString()}</p>
              </div>
              <div className="bg-success/10 p-2 rounded-lg">
                <span className="text-success text-sm font-medium">IN</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Otros</p>
                <p className="text-2xl font-bold text-warning">${gastosPorTipo.otro.toLocaleString()}</p>
              </div>
              <div className="bg-warning/10 p-2 rounded-lg">
                <span className="text-warning text-sm font-medium">OT</span>
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
                placeholder="Buscar gastos por proveedor, tipo o notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Gastos */}
      <div className="grid gap-4">
        {filteredGastos.map((gasto) => (
          <Card key={gasto.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
                <div className="lg:col-span-2">
                  <div className="flex items-start space-x-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <Receipt className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Gasto #{gasto.id.slice(-8)}</h3>
                      <p className="text-sm text-muted-foreground">{gasto.proveedor}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{formatDate(gasto.fecha)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center lg:text-left">
                  <p className="text-sm text-muted-foreground">Monto</p>
                  <p className="text-xl font-bold text-red-600">${gasto.monto.toLocaleString()}</p>
                </div>
                
                <div className="text-center lg:text-left">
                  <Badge className={getTypeColor(gasto.tipo)}>
                    {getTypeLabel(gasto.tipo)}
                  </Badge>
                  {gasto.categoria_fiscal && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {gasto.categoria_fiscal}
                    </p>
                  )}
                </div>
                
                <div className="text-center lg:text-left">
                  {gasto.notas ? (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">Notas:</p>
                      <p className="text-sm mt-1">{gasto.notas}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin notas</p>
                  )}
                </div>
              </div>
              
              <div className="mt-4 flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEdit(gasto)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDelete(gasto.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGastos.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron gastos</h3>
            <p className="text-muted-foreground">
              Intenta cambiar los términos de búsqueda o registra un nuevo gasto.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}