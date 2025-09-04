import { useState } from "react";
import { Plus, Search, Building, Mail, Phone, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useProveedores, Proveedor } from "@/hooks/useProveedores";
import { ProveedorForm } from "@/components/Forms/ProveedorForm";
import toast from "react-hot-toast";

export default function Proveedores() {
  const { proveedores, loading, createProveedor, updateProveedor, deleteProveedor } = useProveedores();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);

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
                </div>
                
                <div className="text-center flex space-x-2 justify-center lg:justify-end">
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
    </div>
  );
}