import { useState } from "react";
import { Plus, Search, Package, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: number;
  name: string;
  cost: number;
  price: number;
  current_stock: number;
  minimum_stock: number;
  category: string;
}

export default function Productos() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const mockProducts: Product[] = [
    {
      id: 1,
      name: "Laptop Dell Inspiron 15",
      cost: 1200,
      price: 1500,
      current_stock: 25,
      minimum_stock: 10,
      category: "Tecnología"
    },
    {
      id: 2,
      name: "Mouse Logitech MX",
      cost: 40,
      price: 50,
      current_stock: 5,
      minimum_stock: 20,
      category: "Accesorios"
    },
    {
      id: 3,
      name: "Teclado Mecánico RGB",
      cost: 180,
      price: 300,
      current_stock: 15,
      minimum_stock: 8,
      category: "Accesorios"
    },
    {
      id: 4,
      name: "Monitor Samsung 27''",
      cost: 350,
      price: 500,
      current_stock: 12,
      minimum_stock: 5,
      category: "Tecnología"
    },
    {
      id: 5,
      name: "Impresora HP LaserJet",
      cost: 400,
      price: 500,
      current_stock: 8,
      minimum_stock: 6,
      category: "Oficina"
    }
  ];

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona tu inventario y productos
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

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
          const stockStatus = getStockStatus(product.current_stock, product.minimum_stock);
          const margin = calculateMargin(product.cost, product.price);
          
          return (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {product.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Costo</p>
                    <p className="font-semibold">${product.cost}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Precio</p>
                    <p className="font-semibold text-success">${product.price}</p>
                    <p className="text-xs text-muted-foreground">{margin}% margen</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Stock</p>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="font-semibold">{product.current_stock}</span>
                      {product.current_stock <= product.minimum_stock && (
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
                  
                  <div className="text-center">
                    <Button variant="outline" size="sm">
                      Editar
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