import { Download, FileText, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Reportes() {
  const reportTypes = [
    {
      title: "Reporte de Ventas",
      description: "Exporta todas las ventas por período",
      icon: TrendingUp,
      formats: ["Excel", "CSV", "PDF"]
    },
    {
      title: "Reporte de Clientes",
      description: "Lista completa de clientes y su actividad",
      icon: FileText,
      formats: ["Excel", "CSV"]
    },
    {
      title: "Reporte de Productos",
      description: "Inventario actual y movimientos",
      icon: FileText,
      formats: ["Excel", "CSV"]
    },
    {
      title: "Reporte de Gastos",
      description: "Todos los gastos registrados por período",
      icon: FileText,
      formats: ["Excel", "CSV"]
    },
    {
      title: "Balance General",
      description: "Resumen financiero completo",
      icon: Calendar,
      formats: ["PDF", "Excel"]
    }
  ];

  const quickReports = [
    { name: "Ventas del Mes Actual", period: "Enero 2024" },
    { name: "Top 10 Productos", period: "Últimos 30 días" },
    { name: "Clientes Más Activos", period: "Últimos 90 días" },
    { name: "Stock Bajo Mínimo", period: "Actual" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
        <p className="text-muted-foreground mt-2">
          Exporta y analiza los datos de tu negocio
        </p>
      </div>

      {/* Reportes Rápidos */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Reportes Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickReports.map((report, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="text-center">
                  <h3 className="font-semibold mb-2">{report.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{report.period}</p>
                  <Button size="sm" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Reportes Personalizados */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Reportes Personalizados</h2>
        <div className="grid gap-6">
          {reportTypes.map((report, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <report.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{report.title}</h3>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {report.formats.map((format) => (
                    <Button key={format} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar {format}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Configuración de Reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Configurar Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Fecha Inicio</label>
              <input 
                type="date" 
                className="w-full mt-1 p-2 border border-input rounded-md"
                defaultValue="2024-01-01"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Fecha Fin</label>
              <input 
                type="date" 
                className="w-full mt-1 p-2 border border-input rounded-md"
                defaultValue="2024-01-31"
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información Adicional */}
      <Card className="bg-accent/50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <FileText className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Información sobre Reportes</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Los reportes se generan con los datos actuales de la base de datos</li>
                <li>• Los archivos Excel incluyen gráficos y formato adicional</li>
                <li>• Los archivos CSV son compatibles con cualquier hoja de cálculo</li>
                <li>• Los reportes PDF incluyen resumen ejecutivo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}