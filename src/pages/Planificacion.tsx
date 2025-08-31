import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Target,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import { usePlanificacion } from "@/hooks/usePlanificacion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import toast from "react-hot-toast";

export default function Planificacion() {
  const { 
    presupuestos, 
    comparaciones, 
    alertas, 
    loading, 
    crearPresupuesto, 
    actualizarPresupuesto, 
    eliminarPresupuesto 
  } = usePlanificacion();
  
  const [isCreatingPresupuesto, setIsCreatingPresupuesto] = useState(false);
  const [editingPresupuesto, setEditingPresupuesto] = useState<any>(null);
  
  const [newPresupuesto, setNewPresupuesto] = useState({
    año: new Date().getFullYear(),
    mes: new Date().getMonth() + 1,
    ingresos_esperados: 0,
    gastos_esperados: 0,
    objetivo_ventas: 0,
    notas: ''
  });

  if (loading) {
    return <div className="p-6">Cargando planificación...</div>;
  }

  const handleCreatePresupuesto = async () => {
    if (!newPresupuesto.ingresos_esperados || !newPresupuesto.gastos_esperados) {
      toast.error('Complete los campos obligatorios');
      return;
    }

    if (editingPresupuesto) {
      await actualizarPresupuesto(editingPresupuesto.id, newPresupuesto);
      setEditingPresupuesto(null);
    } else {
      await crearPresupuesto(newPresupuesto);
    }
    
    setNewPresupuesto({
      año: new Date().getFullYear(),
      mes: new Date().getMonth() + 1,
      ingresos_esperados: 0,
      gastos_esperados: 0,
      objetivo_ventas: 0,
      notas: ''
    });
    setIsCreatingPresupuesto(false);
  };

  const handleEditPresupuesto = (presupuesto: any) => {
    setEditingPresupuesto(presupuesto);
    setNewPresupuesto({
      año: presupuesto.año,
      mes: presupuesto.mes,
      ingresos_esperados: presupuesto.ingresos_esperados,
      gastos_esperados: presupuesto.gastos_esperados,
      objetivo_ventas: presupuesto.objetivo_ventas,
      notas: presupuesto.notas || ''
    });
    setIsCreatingPresupuesto(true);
  };

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Preparar datos para gráficos
  const chartData = comparaciones.map(comp => ({
    periodo: comp.periodo,
    planificadoIngresos: comp.planificado.ingresos,
    realIngresos: comp.real.ingresos,
    planificadoGastos: comp.planificado.gastos,
    realGastos: comp.real.gastos,
    planificadoBalance: comp.planificado.balance,
    realBalance: comp.real.balance
  }));

  const getDesviacionColor = (porcentaje: number) => {
    if (porcentaje > 10) return 'text-green-600';
    if (porcentaje < -10) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getAlertaIcon = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Planificación y Presupuestos</h1>
          <p className="text-muted-foreground mt-2">
            Proyecciones, comparación plan vs real y análisis de desviaciones
          </p>
        </div>
        
        <Dialog open={isCreatingPresupuesto} onOpenChange={(open) => {
          setIsCreatingPresupuesto(open);
          if (!open) {
            setEditingPresupuesto(null);
            setNewPresupuesto({
              año: new Date().getFullYear(),
              mes: new Date().getMonth() + 1,
              ingresos_esperados: 0,
              gastos_esperados: 0,
              objetivo_ventas: 0,
              notas: ''
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Presupuesto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPresupuesto ? 'Editar Presupuesto' : 'Crear Nuevo Presupuesto'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Select value={newPresupuesto.año.toString()} onValueChange={(value) => setNewPresupuesto({...newPresupuesto, año: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Año" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 5}, (_, i) => new Date().getFullYear() + i - 2).map(año => (
                      <SelectItem key={año} value={año.toString()}>{año}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={newPresupuesto.mes.toString()} onValueChange={(value) => setNewPresupuesto({...newPresupuesto, mes: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Mes" />
                  </SelectTrigger>
                  <SelectContent>
                    {meses.map((mes, index) => (
                      <SelectItem key={index} value={(index + 1).toString()}>{mes}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Input
                type="number"
                placeholder="Ingresos esperados"
                value={newPresupuesto.ingresos_esperados || ''}
                onChange={(e) => setNewPresupuesto({...newPresupuesto, ingresos_esperados: Number(e.target.value)})}
              />
              
              <Input
                type="number"
                placeholder="Gastos esperados"
                value={newPresupuesto.gastos_esperados || ''}
                onChange={(e) => setNewPresupuesto({...newPresupuesto, gastos_esperados: Number(e.target.value)})}
              />
              
              <Input
                type="number"
                placeholder="Objetivo de ventas"
                value={newPresupuesto.objetivo_ventas || ''}
                onChange={(e) => setNewPresupuesto({...newPresupuesto, objetivo_ventas: Number(e.target.value)})}
              />
              
              <Textarea
                placeholder="Notas y observaciones"
                value={newPresupuesto.notas}
                onChange={(e) => setNewPresupuesto({...newPresupuesto, notas: e.target.value})}
              />
              
              <Button onClick={handleCreatePresupuesto} className="w-full">
                {editingPresupuesto ? 'Actualizar Presupuesto' : 'Crear Presupuesto'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alertas de Desviación */}
      {alertas.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-600 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alertas de Desviación Presupuestaria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alertas.map((alerta, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  {getAlertaIcon(alerta.tipo)}
                  <div>
                    <p className="font-medium">{alerta.periodo}</p>
                    <p className="text-sm text-muted-foreground">{alerta.mensaje}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos Plan vs Real */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Comparación Plan vs Real - Ingresos y Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                <Bar dataKey="planificadoIngresos" fill="#93c5fd" name="Ingresos Plan" />
                <Bar dataKey="realIngresos" fill="#3b82f6" name="Ingresos Real" />
                <Bar dataKey="planificadoGastos" fill="#fca5a5" name="Gastos Plan" />
                <Bar dataKey="realGastos" fill="#ef4444" name="Gastos Real" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolución del Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                <Line type="monotone" dataKey="planificadoBalance" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Balance Planificado" />
                <Line type="monotone" dataKey="realBalance" stroke="#059669" strokeWidth={3} name="Balance Real" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Comparación Detallada */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis Detallado Plan vs Real</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Período</th>
                  <th className="text-center py-2">Plan</th>
                  <th className="text-center py-2">Real</th>
                  <th className="text-center py-2">Desviación</th>
                  <th className="text-center py-2">%</th>
                  <th className="text-center py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {comparaciones.map((comp) => (
                  <tr key={comp.periodo} className="border-b hover:bg-muted/50">
                    <td className="py-3 font-medium">{comp.periodo}</td>
                    <td className="text-center py-3">
                      <div className="space-y-1">
                        <p className="text-green-600">${comp.planificado.ingresos.toLocaleString()}</p>
                        <p className="text-red-600">${comp.planificado.gastos.toLocaleString()}</p>
                        <p className="font-medium">${comp.planificado.balance.toLocaleString()}</p>
                      </div>
                    </td>
                    <td className="text-center py-3">
                      <div className="space-y-1">
                        <p className="text-green-600">${comp.real.ingresos.toLocaleString()}</p>
                        <p className="text-red-600">${comp.real.gastos.toLocaleString()}</p>
                        <p className="font-medium">${comp.real.balance.toLocaleString()}</p>
                      </div>
                    </td>
                    <td className="text-center py-3">
                      <div className="space-y-1">
                        <p className={comp.desviacion.ingresos >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ${comp.desviacion.ingresos.toLocaleString()}
                        </p>
                        <p className={comp.desviacion.gastos >= 0 ? 'text-red-600' : 'text-green-600'}>
                          ${comp.desviacion.gastos.toLocaleString()}
                        </p>
                        <p className={`font-medium ${comp.desviacion.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${comp.desviacion.balance.toLocaleString()}
                        </p>
                      </div>
                    </td>
                    <td className={`text-center py-3 font-medium ${getDesviacionColor(comp.desviacion.porcentaje)}`}>
                      {comp.desviacion.porcentaje > 0 ? '+' : ''}{comp.desviacion.porcentaje.toFixed(1)}%
                    </td>
                    <td className="text-center py-3">
                      {Math.abs(comp.desviacion.porcentaje) > 20 ? (
                        <Badge variant="destructive">Alta desviación</Badge>
                      ) : Math.abs(comp.desviacion.porcentaje) > 10 ? (
                        <Badge variant="secondary">Desviación moderada</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">En meta</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Presupuestos */}
      <Card>
        <CardHeader>
          <CardTitle>Presupuestos Configurados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {presupuestos.map((presupuesto) => {
              const balanceEsperado = presupuesto.ingresos_esperados - presupuesto.gastos_esperados;
              return (
                <div key={presupuesto.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm">
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {meses[presupuesto.mes - 1]} {presupuesto.año}
                    </h4>
                    <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Ingresos esperados</p>
                        <p className="font-medium text-green-600">${presupuesto.ingresos_esperados.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Gastos esperados</p>
                        <p className="font-medium text-red-600">${presupuesto.gastos_esperados.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Balance esperado</p>
                        <p className={`font-medium ${balanceEsperado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${balanceEsperado.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-muted-foreground text-sm">Objetivo de ventas: ${presupuesto.objetivo_ventas.toLocaleString()}</p>
                      {presupuesto.notas && (
                        <p className="text-muted-foreground text-sm mt-1">{presupuesto.notas}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditPresupuesto(presupuesto)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        if (confirm('¿Está seguro de eliminar este presupuesto?')) {
                          eliminarPresupuesto(presupuesto.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Proyecciones */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Presupuestos Activos</p>
                <p className="text-2xl font-bold">{presupuestos.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Desviación Promedio</p>
                <p className={`text-2xl font-bold ${getDesviacionColor(comparaciones.reduce((sum, c) => sum + c.desviacion.porcentaje, 0) / comparaciones.length)}`}>
                  {comparaciones.length > 0 ? 
                    `${(comparaciones.reduce((sum, c) => sum + c.desviacion.porcentaje, 0) / comparaciones.length).toFixed(1)}%` : 
                    '0%'
                  }
                </p>
              </div>
              <Target className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Metas Cumplidas</p>
                <p className="text-2xl font-bold text-success">
                  {comparaciones.filter(c => c.desviacion.porcentaje >= 0).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Activas</p>
                <p className="text-2xl font-bold text-warning">{alertas.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}