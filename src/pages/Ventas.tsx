import { useState } from "react";
import { Plus, Search, ShoppingCart, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Sale {
  id: number;
  date: string;
  client_name: string;
  total_amount: number;
  payment_method: string;
  status: 'cobrada' | 'pendiente';
  items_count: number;
}

export default function Ventas() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const mockSales: Sale[] = [
    {
      id: 1001,
      date: "2024-01-15",
      client_name: "Tech Solutions S.A.",
      total_amount: 4500,
      payment_method: "transferencia",
      status: "cobrada",
      items_count: 3
    },
    {
      id: 1002,
      date: "2024-01-14",
      client_name: "Innovación Digital",
      total_amount: 1250,
      payment_method: "tarjeta",
      status: "pendiente",
      items_count: 5
    },
    {
      id: 1003,
      date: "2024-01-12",
      client_name: "Desarrollo Móvil",
      total_amount: 3200,
      payment_method: "efectivo",
      status: "cobrada",
      items_count: 2
    },
    {
      id: 1004,
      date: "2024-01-10",
      client_name: "WebCorp Internacional",
      total_amount: 890,
      payment_method: "tarjeta",
      status: "pendiente",
      items_count: 4
    },
    {
      id: 1005,
      date: "2024-01-08",
      client_name: "Sistemas Avanzados",
      total_amount: 2100,
      payment_method: "transferencia",
      status: "cobrada",
      items_count: 1
    }
  ];

  const filteredSales = mockSales.filter(sale =>
    sale.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.id.toString().includes(searchTerm)
  );

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

  const totalVentas = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const ventasCobradas = filteredSales.filter(sale => sale.status === 'cobrada').length;
  const ventasPendientes = filteredSales.filter(sale => sale.status === 'pendiente').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ventas</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona las ventas de tu negocio
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Venta
        </Button>
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
                <p className="text-2xl font-bold">{filteredSales.length}</p>
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
        {filteredSales.map((sale) => (
          <Card key={sale.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                <div className="lg:col-span-2">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Venta #{sale.id}</h3>
                      <p className="text-sm text-muted-foreground">{sale.client_name}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center lg:text-left">
                  <div className="flex items-center space-x-2 lg:justify-start justify-center">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formatDate(sale.date)}</span>
                  </div>
                </div>
                
                <div className="text-center lg:text-left">
                  <p className="text-sm text-muted-foreground">Monto</p>
                  <p className="text-xl font-bold text-success">${sale.total_amount.toLocaleString()}</p>
                </div>
                
                <div className="text-center lg:text-left">
                  <p className="text-sm text-muted-foreground">{getPaymentMethodLabel(sale.payment_method)}</p>
                  <p className="text-sm">{sale.items_count} productos</p>
                </div>
                
                <div className="text-center lg:text-left">
                  <Badge className={getStatusColor(sale.status)}>
                    {sale.status === 'cobrada' ? 'Cobrada' : 'Pendiente'}
                  </Badge>
                </div>
                
                <div className="text-center">
                  <Button variant="outline" size="sm">
                    Ver Detalles
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSales.length === 0 && (
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