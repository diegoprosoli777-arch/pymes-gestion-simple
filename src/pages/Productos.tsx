import { useState } from "react";
import { Plus, Search, Package, AlertCircle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProductos } from "@/hooks/useProductos";
import { ProductoForm } from "@/components/Forms/ProductoForm";

export default function Productos() {
  const { productos, loading, createProducto, updateProducto, deleteProducto } = useProductos();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);

  const filteredProducts = productos.filter(product =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (current: number, minimum: number) => {
    if (current <= minimum) {
      return { status: "Crítico", color: "destructive" as const };
    }
    if (current <= minimum * 1.5) {
      return { status: "Bajo", color: "warning" as const };
    }
    return { status: "Normal", color: "success" as const };
  };

  const calculateMargin = (cost: number, price: number) => {
    return ((price - cost) / price * 100).toFixed(1);
  };

  const handleEdit = (producto) => {
    setEditingProducto(producto);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProducto(null);
  };

  const handleSubmit = async (data) => {
    if (editingProducto) {
      await updateProducto(editingProducto.id, data);
    } else {
      await createProducto(data);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      await deleteProducto(id);
    }
  };

  if (loading) {
    return <div className="p-6">Cargando productos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona tu inventario y productos
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover" onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      <ProductoForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        initialData={editingProducto}
        title={editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
      />

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Productos */}
      <div className="grid gap-4">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product.stock_actual, product.stock_minimo);
          const margin = calculateMargin(product.costo, product.precio);
          
          return (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{product.nombre}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {product.categoria}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Costo</p>
                    <p className="font-semibold">${product.costo}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Precio</p>
                    <p className="font-semibold text-success">${product.precio}</p>
                    <p className="text-xs text-muted-foreground">{margin}% margen</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Stock</p>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="font-semibold">{product.stock_actual}</span>
                      {product.stock_actual <= product.stock_minimo && (
                        <AlertCircle className="h-4 w-4 text-danger" />
                      )}
                    </div>
                    <Badge 
                      variant={stockStatus.color === 'success' ? 'default' : 'destructive'}
                      className={`mt-1 ${
                        stockStatus.color === 'warning' ? 'bg-warning text-warning-foreground' : ''
                      }`}
                    >
                      {stockStatus.status}
                    </Badge>
                  </div>
                  
                  <div className="flex space-x-2 justify-center">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron productos</h3>
            <p className="text-muted-foreground">
              Intenta cambiar los términos de búsqueda o agrega un nuevo producto.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}