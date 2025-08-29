import { useState } from "react";
import { Plus, Search, Receipt, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Expense {
  id: number;
  date: string;
  provider: string;
  amount: number;
  type: 'operativo' | 'insumo' | 'otro';
  notes: string;
}

export default function Gastos() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const mockExpenses: Expense[] = [
    {
      id: 501,
      date: "2024-01-15",
      provider: "Distribuidora Tech",
      amount: 12500,
      type: "insumo",
      notes: "Compra de inventario mensual"
    },
    {
      id: 502,
      date: "2024-01-12",
      provider: "CFE",
      amount: 2400,
      type: "operativo",
      notes: "Pago de electricidad"
    },
    {
      id: 503,
      date: "2024-01-10",
      provider: "Publicidad Online",
      amount: 3500,
      type: "otro",
      notes: "Campaña publicitaria Google Ads"
    },
    {
      id: 504,
      date: "2024-01-08",
      provider: "Proveedor Local",
      amount: 8900,
      type: "insumo",
      notes: "Mercancía para reventa"
    },
    {
      id: 505,
      date: "2024-01-05",
      provider: "Telmex",
      amount: 1200,
      type: "operativo",
      notes: "Internet y telefonía"
    },
    {
      id: 506,
      date: "2024-01-03",
      provider: "Limpieza Profesional",
      amount: 800,
      type: "operativo",
      notes: "Servicio de limpieza"
    }
  ];

  const filteredExpenses = mockExpenses.filter(expense =>
    expense.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const totalGastos = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const gastosPorTipo = {
    operativo: filteredExpenses.filter(e => e.type === 'operativo').reduce((sum, e) => sum + e.amount, 0),
    insumo: filteredExpenses.filter(e => e.type === 'insumo').reduce((sum, e) => sum + e.amount, 0),
    otro: filteredExpenses.filter(e => e.type === 'otro').reduce((sum, e) => sum + e.amount, 0)
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
        <Button className="bg-primary hover:bg-primary-hover">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Gasto
        </Button>
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
        {filteredExpenses.map((expense) => (
          <Card key={expense.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
                <div className="lg:col-span-2">
                  <div className="flex items-start space-x-3">
                    <div className="bg-danger/10 p-2 rounded-lg">
                      <Receipt className="h-5 w-5 text-danger" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Gasto #{expense.id}</h3>
                      <p className="text-sm text-muted-foreground">{expense.provider}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{formatDate(expense.date)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center lg:text-left">
                  <p className="text-sm text-muted-foreground">Monto</p>
                  <p className="text-xl font-bold text-danger">${expense.amount.toLocaleString()}</p>
                </div>
                
                <div className="text-center lg:text-left">
                  <Badge className={getTypeColor(expense.type)}>
                    {getTypeLabel(expense.type)}
                  </Badge>
                </div>
                
                <div className="text-center lg:text-left">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Notas:</p>
                    <p className="text-sm mt-1">{expense.notes}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm">
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExpenses.length === 0 && (
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