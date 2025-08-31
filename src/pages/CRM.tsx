import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  UserPlus, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  MessageCircle,
  Plus
} from "lucide-react";
import { useCRM } from "@/hooks/useCRM";
import { useClientes } from "@/hooks/useClientes";
import toast from "react-hot-toast";

export default function CRM() {
  const { pipeline, tareas, interacciones, loading, updatePipelineStatus, completarTarea, crearTarea, crearInteraccion } = useCRM();
  const { clientes } = useClientes();
  const [selectedTab, setSelectedTab] = useState<'pipeline' | 'tareas' | 'interacciones'>('pipeline');
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isCreatingInteraction, setIsCreatingInteraction] = useState(false);

  // Formulario para nueva tarea
  const [newTask, setNewTask] = useState({
    cliente_id: '',
    titulo: '',
    descripcion: '',
    tipo: 'llamada' as 'llamada' | 'reunion' | 'seguimiento' | 'email',
    fecha_vencimiento: '',
    prioridad: 'media' as 'alta' | 'media' | 'baja'
  });

  // Formulario para nueva interacción
  const [newInteraction, setNewInteraction] = useState({
    cliente_id: '',
    tipo: '',
    titulo: '',
    descripcion: ''
  });

  if (loading) {
    return <div className="p-6">Cargando CRM...</div>;
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'prospecto':
        return 'bg-blue-100 text-blue-800';
      case 'negociacion':
        return 'bg-yellow-100 text-yellow-800';
      case 'ganado':
        return 'bg-green-100 text-green-800';
      case 'perdido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta':
        return 'bg-red-100 text-red-800';
      case 'media':
        return 'bg-yellow-100 text-yellow-800';
      case 'baja':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.cliente_id || !newTask.titulo) {
      toast.error('Complete los campos obligatorios');
      return;
    }

    await crearTarea({
      ...newTask,
      fecha_vencimiento: newTask.fecha_vencimiento ? new Date(newTask.fecha_vencimiento).toISOString() : undefined
    });
    
    setNewTask({
      cliente_id: '',
      titulo: '',
      descripcion: '',
      tipo: 'llamada',
      fecha_vencimiento: '',
      prioridad: 'media'
    });
    setIsCreatingTask(false);
  };

  const handleCreateInteraction = async () => {
    if (!newInteraction.cliente_id || !newInteraction.titulo) {
      toast.error('Complete los campos obligatorios');
      return;
    }

    await crearInteraccion(newInteraction);
    
    setNewInteraction({
      cliente_id: '',
      tipo: '',
      titulo: '',
      descripcion: ''
    });
    setIsCreatingInteraction(false);
  };

  // Estadísticas del pipeline
  const pipelineStats = {
    prospectos: pipeline.filter(p => p.estado === 'prospecto').length,
    negociacion: pipeline.filter(p => p.estado === 'negociacion').length,
    ganados: pipeline.filter(p => p.estado === 'ganado').length,
    perdidos: pipeline.filter(p => p.estado === 'perdido').length,
    valorTotal: pipeline.reduce((sum, p) => sum + p.valor_estimado, 0)
  };

  const tareasPendientes = tareas.filter(t => !t.completada);
  const tareasVencidas = tareasPendientes.filter(t => 
    t.fecha_vencimiento && new Date(t.fecha_vencimiento) < new Date()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CRM - Gestión de Clientes</h1>
          <p className="text-muted-foreground mt-2">
            Pipeline de ventas, tareas e interacciones con clientes
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={isCreatingTask} onOpenChange={setIsCreatingTask}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Tarea
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Tarea</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={newTask.cliente_id} onValueChange={(value) => setNewTask({...newTask, cliente_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>{cliente.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Input
                  placeholder="Título de la tarea"
                  value={newTask.titulo}
                  onChange={(e) => setNewTask({...newTask, titulo: e.target.value})}
                />
                
                <Textarea
                  placeholder="Descripción"
                  value={newTask.descripcion}
                  onChange={(e) => setNewTask({...newTask, descripcion: e.target.value})}
                />
                
                <Select value={newTask.tipo} onValueChange={(value: any) => setNewTask({...newTask, tipo: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="llamada">Llamada</SelectItem>
                    <SelectItem value="reunion">Reunión</SelectItem>
                    <SelectItem value="seguimiento">Seguimiento</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  type="datetime-local"
                  value={newTask.fecha_vencimiento}
                  onChange={(e) => setNewTask({...newTask, fecha_vencimiento: e.target.value})}
                />
                
                <Select value={newTask.prioridad} onValueChange={(value: any) => setNewTask({...newTask, prioridad: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={handleCreateTask} className="w-full">Crear Tarea</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreatingInteraction} onOpenChange={setIsCreatingInteraction}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <MessageCircle className="h-4 w-4 mr-2" />
                Nueva Interacción
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Interacción</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={newInteraction.cliente_id} onValueChange={(value) => setNewInteraction({...newInteraction, cliente_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>{cliente.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Input
                  placeholder="Tipo de interacción (ej: llamada, reunión)"
                  value={newInteraction.tipo}
                  onChange={(e) => setNewInteraction({...newInteraction, tipo: e.target.value})}
                />
                
                <Input
                  placeholder="Título de la interacción"
                  value={newInteraction.titulo}
                  onChange={(e) => setNewInteraction({...newInteraction, titulo: e.target.value})}
                />
                
                <Textarea
                  placeholder="Descripción de la interacción"
                  value={newInteraction.descripcion}
                  onChange={(e) => setNewInteraction({...newInteraction, descripcion: e.target.value})}
                />
                
                <Button onClick={handleCreateInteraction} className="w-full">Registrar Interacción</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPIs del Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prospectos</p>
                <p className="text-2xl font-bold text-blue-600">{pipelineStats.prospectos}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Negociación</p>
                <p className="text-2xl font-bold text-yellow-600">{pipelineStats.negociacion}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ganados</p>
                <p className="text-2xl font-bold text-green-600">{pipelineStats.ganados}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tareas Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">{tareasPendientes.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total Pipeline</p>
                <p className="text-lg font-bold text-primary">${pipelineStats.valorTotal.toLocaleString()}</p>
              </div>
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setSelectedTab('pipeline')}
          className={`pb-2 px-4 ${selectedTab === 'pipeline' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
        >
          Pipeline de Ventas
        </button>
        <button
          onClick={() => setSelectedTab('tareas')}
          className={`pb-2 px-4 ${selectedTab === 'tareas' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
        >
          Tareas y Recordatorios
        </button>
        <button
          onClick={() => setSelectedTab('interacciones')}
          className={`pb-2 px-4 ${selectedTab === 'interacciones' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
        >
          Historial de Interacciones
        </button>
      </div>

      {/* Pipeline Tab */}
      {selectedTab === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['prospecto', 'negociacion', 'ganado', 'perdido'].map((estado) => (
            <Card key={estado}>
              <CardHeader>
                <CardTitle className="text-sm">
                  {estado === 'prospecto' && 'Prospectos'}
                  {estado === 'negociacion' && 'En Negociación'}
                  {estado === 'ganado' && 'Ganados'}
                  {estado === 'perdido' && 'Perdidos'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pipeline.filter(p => p.estado === estado).map((cliente) => (
                    <div key={cliente.id} className="p-3 border rounded-lg">
                      <h4 className="font-medium">{cliente.cliente?.nombre}</h4>
                      <p className="text-sm text-muted-foreground">{cliente.cliente?.empresa}</p>
                      <div className="mt-2">
                        <p className="text-sm">Valor: ${cliente.valor_estimado.toLocaleString()}</p>
                        <p className="text-sm">Probabilidad: {cliente.probabilidad}%</p>
                      </div>
                      {cliente.notas && (
                        <p className="text-xs text-muted-foreground mt-1">{cliente.notas}</p>
                      )}
                      <div className="flex space-x-1 mt-2">
                        {estado !== 'ganado' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => updatePipelineStatus(cliente.id, 'ganado', 'Cliente convertido')}
                          >
                            Ganar
                          </Button>
                        )}
                        {estado !== 'perdido' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => updatePipelineStatus(cliente.id, 'perdido', 'Oportunidad perdida')}
                          >
                            Perder
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tareas Tab */}
      {selectedTab === 'tareas' && (
        <div className="space-y-4">
          {/* Tareas vencidas */}
          {tareasVencidas.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Tareas Vencidas ({tareasVencidas.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tareasVencidas.map((tarea) => (
                    <div key={tarea.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{tarea.titulo}</h4>
                        <p className="text-sm text-muted-foreground">{tarea.cliente?.nombre}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <Badge className={getPrioridadColor(tarea.prioridad)}>{tarea.prioridad}</Badge>
                          <span className="text-xs text-red-600">
                            Vencía: {new Date(tarea.fecha_vencimiento!).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => completarTarea(tarea.id)}>
                        Completar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Todas las tareas pendientes */}
          <Card>
            <CardHeader>
              <CardTitle>Tareas Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tareasPendientes.map((tarea) => (
                  <div key={tarea.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {tarea.tipo === 'llamada' && <Phone className="h-4 w-4" />}
                        {tarea.tipo === 'email' && <Mail className="h-4 w-4" />}
                        {tarea.tipo === 'reunion' && <Calendar className="h-4 w-4" />}
                        {tarea.tipo === 'seguimiento' && <MessageCircle className="h-4 w-4" />}
                        <h4 className="font-medium">{tarea.titulo}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{tarea.cliente?.nombre}</p>
                      {tarea.descripcion && (
                        <p className="text-sm text-muted-foreground mt-1">{tarea.descripcion}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge className={getPrioridadColor(tarea.prioridad)}>{tarea.prioridad}</Badge>
                        {tarea.fecha_vencimiento && (
                          <span className="text-xs text-muted-foreground">
                            Vence: {new Date(tarea.fecha_vencimiento).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => completarTarea(tarea.id)}>
                      Completar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Interacciones Tab */}
      {selectedTab === 'interacciones' && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Interacciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {interacciones.map((interaccion) => (
                <div key={interaccion.id} className="border-l-4 border-primary pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{interaccion.titulo}</h4>
                    <span className="text-sm text-muted-foreground">
                      {new Date(interaccion.fecha).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{interaccion.cliente?.nombre}</p>
                  <Badge variant="outline" className="mt-1">{interaccion.tipo}</Badge>
                  {interaccion.descripcion && (
                    <p className="text-sm mt-2">{interaccion.descripcion}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}