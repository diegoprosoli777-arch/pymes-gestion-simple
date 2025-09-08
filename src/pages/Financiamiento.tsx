import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from "lucide-react";
import { useFinanciamiento } from "@/hooks/useFinanciamiento";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

export default function Financiamiento() {
  const { flujoCaja, kpisFinancieros, loading, sugerencias } = useFinanciamiento();

  if (loading) {
    return <div className="p-6">Cargando análisis financiero...</div>;
  }

  const getSugerenciaIcon = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'danger':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-blue-600" />;
    }
  };

  const getSugerenciaColor = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'danger':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Preparar datos para gráficos
  const chartData = flujoCaja.map(item => ({
    mes: item.mes,
    ingresos: item.ingresos,
    egresos: item.egresos,
    balance: item.balance,
    acumulado: item.acumulado
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financiamiento y Flujo de Caja</h1>
          <p className="text-muted-foreground mt-2">
            Análisis financiero y optimización del ciclo de capital
          </p>
        </div>
        <Button>
          <BarChart3 className="h-4 w-4 mr-2" />
          Exportar Análisis
        </Button>
      </div>

      {/* KPIs Financieros */}
      {kpisFinancieros && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Días Promedio de Cobro</p>
                  <p className="text-3xl font-bold">{kpisFinancieros.diasPromedioCobro}</p>
                  <p className="text-sm text-muted-foreground">días</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              {kpisFinancieros.diasPromedioCobro > 30 && (
                <div className="mt-4 p-2 bg-yellow-100 rounded-lg">
                  <p className="text-sm text-yellow-800">Considere reducir el tiempo de cobro</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Liquidez Actual</p>
                  <p className="text-3xl font-bold">{kpisFinancieros.liquidezActual.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">disponible</p>
                </div>
                <DollarSign className="h-8 w-8 text-success" />
              </div>
              {kpisFinancieros.liquidezActual < 20 && (
                <div className="mt-4 p-2 bg-red-100 rounded-lg">
                  <p className="text-sm text-red-800">Liquidez baja - revisar gastos</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ventas por Cobrar</p>
                  <p className="text-2xl font-bold">${kpisFinancieros.ventasPorCobrar.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">pendientes</p>
                </div>
                <TrendingUp className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Días Promedio de Pago</p>
                  <p className="text-3xl font-bold">{kpisFinancieros.diasPromedioPago}</p>
                  <p className="text-sm text-muted-foreground">días</p>
                </div>
                <Calendar className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rotación Cuentas por Cobrar</p>
                  <p className="text-3xl font-bold">{kpisFinancieros.rotacionCuentasCobrar}</p>
                  <p className="text-sm text-muted-foreground">veces/mes</p>
                </div>
                <TrendingUp className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gastos por Pagar</p>
                  <p className="text-2xl font-bold">${kpisFinancieros.gastosPorPagar.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">estimados</p>
                </div>
                <TrendingDown className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos de Flujo de Caja */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Flujo de Caja Mensual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Flujo de Caja Mensual</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Análisis de ingresos, egresos y balance mensual
            </p>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Ingresos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Egresos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Balance Neto</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.3)" />
                <XAxis 
                  dataKey="mes" 
                  stroke="hsl(var(--foreground) / 0.8)"
                  fontSize={12}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  stroke="hsl(var(--foreground) / 0.8)"
                  fontSize={12}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(value) => `$${(Number(value) / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    `$${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 0 })}`, 
                    name === 'ingresos' ? '💰 Ingresos' : 
                    name === 'egresos' ? '💸 Egresos' : 
                    '📊 Balance Neto'
                  ]}
                  labelFormatter={(label) => `📅 ${label}`}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ingresos" 
                  stroke="#10B981" 
                  strokeWidth={3} 
                  name="ingresos"
                  dot={{ fill: "#10B981", r: 5, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 7, fill: "#10B981", strokeWidth: 2, stroke: "#fff" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="egresos" 
                  stroke="#EF4444" 
                  strokeWidth={3} 
                  name="egresos"
                  dot={{ fill: "#EF4444", r: 5, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 7, fill: "#EF4444", strokeWidth: 2, stroke: "#fff" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#3B82F6" 
                  strokeWidth={4} 
                  name="balance"
                  dot={{ fill: "#3B82F6", r: 6, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 8, fill: "#3B82F6", strokeWidth: 2, stroke: "#fff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Balance Acumulado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>Balance Acumulado Mensual</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Evolución del capital disponible acumulado mes a mes
            </p>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span>Balance Acumulado</span>
              <div className="ml-4 text-xs text-muted-foreground">
                Suma progresiva de todos los balances mensuales
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.3)" />
                <XAxis 
                  dataKey="mes" 
                  stroke="hsl(var(--foreground) / 0.8)"
                  fontSize={12}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  stroke="hsl(var(--foreground) / 0.8)"
                  fontSize={12}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(value) => `$${(Number(value) / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  formatter={(value) => [
                    `$${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 0 })}`,
                    '💰 Balance Acumulado'
                  ]}
                  labelFormatter={(label) => `📅 ${label}`}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar 
                  dataKey="acumulado" 
                  name="Balance Acumulado"
                  radius={[6, 6, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.acumulado >= 0 ? "#10B981" : "#EF4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Balance Positivo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Balance Negativo</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sugerencias de Optimización */}
      {sugerencias.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-warning" />
              Sugerencias de Optimización Financiera
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sugerencias.map((sugerencia, index) => (
                <div key={index} className={`p-4 border rounded-lg ${getSugerenciaColor(sugerencia.tipo)}`}>
                  <div className="flex items-start space-x-3">
                    {getSugerenciaIcon(sugerencia.tipo)}
                    <div>
                      <h4 className="font-semibold">{sugerencia.titulo}</h4>
                      <p className="text-sm mt-1">{sugerencia.descripcion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Análisis del Ciclo Financiero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Análisis del Ciclo de Conversión de Efectivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">Días de Cobro</span>
                <span className="text-lg font-bold">{kpisFinancieros?.diasPromedioCobro || 0} días</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Días de Pago</span>
                <span className="text-lg font-bold">{kpisFinancieros?.diasPromedioPago || 0} días</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="font-medium">Ciclo de Efectivo</span>
                <span className="text-lg font-bold">
                  {(kpisFinancieros?.diasPromedioCobro || 0) - (kpisFinancieros?.diasPromedioPago || 0)} días
                </span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Recomendación:</strong> Un ciclo de efectivo menor es mejor para su liquidez. 
                Considere acelerar cobros y optimizar pagos.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen de Posición Financiera</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-success">
                  ${(flujoCaja[flujoCaja.length - 1]?.acumulado || 0).toLocaleString()}
                </h3>
                <p className="text-sm text-muted-foreground">Balance Acumulado Actual</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-600">
                    ${(flujoCaja[flujoCaja.length - 1]?.ingresos || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-green-800">Ingresos Último Mes</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-lg font-bold text-red-600">
                    ${(flujoCaja[flujoCaja.length - 1]?.egresos || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-red-800">Egresos Último Mes</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Balance del Mes</span>
                  <span className={`text-lg font-bold ${(flujoCaja[flujoCaja.length - 1]?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${(flujoCaja[flujoCaja.length - 1]?.balance || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}