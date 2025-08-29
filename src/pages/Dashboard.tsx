import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Package,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import KPICard from "@/components/Dashboard/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  // Mock data para demostrar
  const mockProducts = [
    { name: "Laptop Dell", sales: 45, revenue: "$67,500" },
    { name: "Mouse Logitech", sales: 89, revenue: "$4,450" },
    { name: "Teclado Mecánico", sales: 32, revenue: "$9,600" },
    { name: "Monitor Samsung", sales: 28, revenue: "$14,000" },
    { name: "Impresora HP", sales: 15, revenue: "$7,500" }
  ];

  const mockClients = [
    { name: "Tech Solutions S.A.", revenue: "$25,400", orders: 12 },
    { name: "Innovación Digital", revenue: "$18,750", orders: 8 },
    { name: "Sistemas Avanzados", revenue: "$16,200", orders: 15 },
    { name: "Desarrollo Móvil", revenue: "$12,800", orders: 6 },
    { name: "WebCorp Internacional", revenue: "$11,500", orders: 9 }
  ];

  const mockLowStock = [
    { name: "Cable USB-C", current: 5, minimum: 20 },
    { name: "Adaptador HDMI", current: 8, minimum: 15 },
    { name: "Memoria USB 64GB", current: 12, minimum: 25 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Resumen general de tu negocio
        </p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Ventas del Mes"
          value="$156,240"
          change="+12.5% vs mes anterior"
          changeType="positive"
          icon={DollarSign}
        />
        <KPICard
          title="Ticket Promedio"
          value="$1,247"
          change="+5.2% vs mes anterior"
          changeType="positive"
          icon={TrendingUp}
        />
        <KPICard
          title="Clientes Activos"
          value="342"
          change="+18 este mes"
          changeType="positive"
          icon={Users}
        />
        <KPICard
          title="Productos en Stock"
          value="1,249"
          change="3 productos bajo mínimo"
          changeType="negative"
          icon={Package}
        />
        <KPICard
          title="Facturas Cobradas"
          value="87%"
          change="13% pendientes"
          changeType="neutral"
          icon={CheckCircle}
        />
        <KPICard
          title="Balance del Mes"
          value="$94,520"
          change="Ingresos - Egresos"
          changeType="positive"
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Productos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top 5 Productos Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.sales} unidades</p>
                    </div>
                  </div>
                  <span className="font-semibold text-success">{product.revenue}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Clientes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Ranking de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockClients.map((client, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-success/10 text-success rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.orders} órdenes</p>
                    </div>
                  </div>
                  <span className="font-semibold text-success">{client.revenue}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Crítico */}
      <Card className="border-warning">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center space-x-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
            <span>Stock Crítico</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockLowStock.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-warning-light rounded-lg">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Stock actual: {item.current} | Mínimo: {item.minimum}
                  </p>
                </div>
                <span className="text-warning font-semibold">
                  Reabastecer
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}