import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Package,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import KPICard from "@/components/Dashboard/KPICard";
import { useDashboard } from "@/hooks/useDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { kpis, loading } = useDashboard();

  if (loading) {
    return <div className="p-6">Cargando dashboard...</div>;
  }

  if (!kpis) {
    return <div className="p-6">Error al cargar datos</div>;
  }

  const ventasChange = kpis.ventasMesAnterior > 0 
    ? ((kpis.ventasDelMes - kpis.ventasMesAnterior) / kpis.ventasMesAnterior * 100).toFixed(1)
    : '0';

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
          value={`$${kpis.ventasDelMes.toLocaleString()}`}
          change={`${ventasChange}% vs mes anterior`}
          changeType={Number(ventasChange) >= 0 ? "positive" : "negative"}
          icon={DollarSign}
        />
        <KPICard
          title="Ticket Promedio"
          value={`$${kpis.ticketPromedio.toLocaleString()}`}
          change="Promedio por venta"
          changeType="neutral"
          icon={TrendingUp}
        />
        <KPICard
          title="Clientes Activos"
          value={kpis.clientesActivos.toString()}
          change="Clientes registrados"
          changeType="positive"
          icon={Users}
        />
        <KPICard
          title="Productos en Stock"
          value={kpis.productosEnStock.toString()}
          change={`${kpis.productosStockBajo} productos bajo mínimo`}
          changeType={kpis.productosStockBajo > 0 ? "negative" : "positive"}
          icon={Package}
        />
        <KPICard
          title="Facturas Cobradas"
          value={`${kpis.facturasCobradasPorcentaje.toFixed(1)}%`}
          change={`${(100-kpis.facturasCobradasPorcentaje).toFixed(1)}% pendientes`}
          changeType="neutral"
          icon={CheckCircle}
        />
        <KPICard
          title="Balance del Mes"
          value={`$${kpis.balanceDelMes.toLocaleString()}`}
          change="Ingresos - Egresos"
          changeType={kpis.balanceDelMes >= 0 ? "positive" : "negative"}
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
              {kpis.topProductos.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.nombre}</p>
                      <p className="text-sm text-muted-foreground">{product.ventas} unidades</p>
                    </div>
                  </div>
                  <span className="font-semibold text-success">${product.revenue.toLocaleString()}</span>
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
              {kpis.topClientes.map((client, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-success/10 text-success rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{client.nombre}</p>
                      <p className="text-sm text-muted-foreground">{client.ordenes} órdenes</p>
                    </div>
                  </div>
                  <span className="font-semibold text-success">${client.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Crítico */}
      {kpis.stockCritico.length > 0 && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center space-x-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              <span>Stock Crítico</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kpis.stockCritico.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-warning-light rounded-lg">
                  <div>
                    <p className="font-medium">{item.nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      Stock actual: {item.stock_actual} | Mínimo: {item.stock_minimo}
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
      )}
    </div>
  );
}