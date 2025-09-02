import { useState } from "react";
import { Plus, Search, User, Mail, Phone, Building, Edit, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useClientes } from "@/hooks/useClientes";
import { ClienteForm } from "@/components/Forms/ClienteForm";
import { exportClientesReport } from "@/lib/excel";
import toast from "react-hot-toast";

export default function Clientes() {
  const { clientes, loading, deleteCliente, createCliente, updateCliente } = useClientes();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<any>(null);
  const [viewingCliente, setViewingCliente] = useState<any>(null);

  if (loading) {
    return <div className="p-6">Cargando clientes...</div>;
  }

  const filteredClients = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.empresa?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'prospecto':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactivo':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'Activo';
      case 'prospecto':
        return 'Prospecto';
      case 'inactivo':
        return 'Inactivo';
      default:
        return estado;
    }
  };

  const handleEdit = (cliente: any) => {
    setEditingCliente(cliente);
    setIsFormOpen(true);
  };

  const handleView = (cliente: any) => {
    setViewingCliente(cliente);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este cliente?')) {
      await deleteCliente(id);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCliente(null);
  };

  const handleExport = () => {
    exportClientesReport(clientes);
    toast.success('Reporte de clientes exportado');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona tu cartera de clientes
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
                Nuevo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
                </DialogTitle>
              </DialogHeader>
              <ClienteForm
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                onSubmit={editingCliente ? 
                  (data) => updateCliente(editingCliente.id, data) :
                  createCliente
                }
                initialData={editingCliente}
                title={editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar clientes por nombre, email o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <div className="grid gap-4">
        {filteredClients.map((cliente) => (
          <Card key={cliente.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Información del Cliente */}
                <div className="lg:col-span-2">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-lg">{cliente.nombre}</h3>
                        <Badge className={getStatusColor(cliente.estado)}>
                          {getStatusLabel(cliente.estado)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {cliente.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>{cliente.email}</span>
                          </div>
                        )}
                        {cliente.telefono && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>{cliente.telefono}</span>
                          </div>
                        )}
                        {cliente.empresa && (
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4" />
                            <span>{cliente.empresa}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="text-center lg:text-left">
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <p className="text-lg font-medium">{getStatusLabel(cliente.estado)}</p>
                  {cliente.notas && (
                    <p className="text-sm text-muted-foreground mt-1">
                      "{cliente.notas}"
                    </p>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleView(cliente)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(cliente)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(cliente.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para ver detalles del cliente */}
      <Dialog open={!!viewingCliente} onOpenChange={() => setViewingCliente(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles del Cliente</DialogTitle>
          </DialogHeader>
          {viewingCliente && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{viewingCliente.nombre}</h3>
                <Badge className={getStatusColor(viewingCliente.estado)}>
                  {getStatusLabel(viewingCliente.estado)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm">{viewingCliente.email || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Teléfono</label>
                  <p className="text-sm">{viewingCliente.telefono || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Empresa</label>
                  <p className="text-sm">{viewingCliente.empresa || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Fecha de registro</label>
                  <p className="text-sm">{new Date(viewingCliente.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              {viewingCliente.notas && (
                <div>
                  <label className="text-sm font-medium">Notas</label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{viewingCliente.notas}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron clientes</h3>
            <p className="text-muted-foreground">
              Intenta cambiar los términos de búsqueda o agrega un nuevo cliente.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}