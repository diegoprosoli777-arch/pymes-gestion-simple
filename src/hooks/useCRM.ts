import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';

export interface PipelineCliente {
  id: string;
  cliente_id: string;
  estado: 'prospecto' | 'negociacion' | 'ganado' | 'perdido';
  valor_estimado: number;
  probabilidad: number;
  fecha_cambio_estado: string;
  notas?: string;
  cliente?: {
    nombre: string;
    email: string;
    empresa?: string;
  };
}

export interface TareaCliente {
  id: string;
  cliente_id: string;
  titulo: string;
  descripcion?: string;
  tipo: 'llamada' | 'reunion' | 'seguimiento' | 'email';
  fecha_vencimiento?: string;
  completada: boolean;
  fecha_completado?: string;
  prioridad: 'alta' | 'media' | 'baja';
  cliente?: {
    nombre: string;
  };
}

export interface InteraccionCliente {
  id: string;
  cliente_id: string;
  tipo: string;
  titulo: string;
  descripcion?: string;
  fecha: string;
  cliente?: {
    nombre: string;
  };
}

export const useCRM = () => {
  const [pipeline, setPipeline] = useState<PipelineCliente[]>([]);
  const [tareas, setTareas] = useState<TareaCliente[]>([]);
  const [interacciones, setInteracciones] = useState<InteraccionCliente[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPipeline = async () => {
    try {
      const { data, error } = await supabase
        .from('pipeline_clientes')
        .select(`
          *,
          cliente:clientes(nombre, email, empresa)
        `);
      
      if (error) throw error;
      setPipeline(data as PipelineCliente[] || []);
    } catch (error) {
      console.error('Error fetching pipeline:', error);
      toast.error('Error al cargar pipeline');
    }
  };

  const fetchTareas = async () => {
    try {
      const { data, error } = await supabase
        .from('tareas_clientes')
        .select(`
          *,
          cliente:clientes(nombre)
        `)
        .order('fecha_vencimiento', { ascending: true });
      
      if (error) throw error;
      setTareas(data as TareaCliente[] || []);
    } catch (error) {
      console.error('Error fetching tareas:', error);
      toast.error('Error al cargar tareas');
    }
  };

  const fetchInteracciones = async () => {
    try {
      const { data, error } = await supabase
        .from('interacciones_clientes')
        .select(`
          *,
          cliente:clientes(nombre)
        `)
        .order('fecha', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setInteracciones(data || []);
    } catch (error) {
      console.error('Error fetching interacciones:', error);
      toast.error('Error al cargar interacciones');
    }
  };

  const updatePipelineStatus = async (id: string, estado: string, notas?: string) => {
    try {
      const { error } = await supabase
        .from('pipeline_clientes')
        .update({ 
          estado, 
          fecha_cambio_estado: new Date().toISOString().split('T')[0],
          notas 
        })
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchPipeline();
      toast.success('Estado actualizado correctamente');
    } catch (error) {
      console.error('Error updating pipeline:', error);
      toast.error('Error al actualizar estado');
    }
  };

  const completarTarea = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tareas_clientes')
        .update({ 
          completada: true,
          fecha_completado: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchTareas();
      toast.success('Tarea completada');
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Error al completar tarea');
    }
  };

  const crearTarea = async (tarea: Omit<TareaCliente, 'id' | 'completada' | 'cliente'>) => {
    try {
      const { error } = await supabase
        .from('tareas_clientes')
        .insert([tarea]);
      
      if (error) throw error;
      
      await fetchTareas();
      toast.success('Tarea creada correctamente');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Error al crear tarea');
    }
  };

  const crearInteraccion = async (interaccion: Omit<InteraccionCliente, 'id' | 'fecha' | 'cliente'>) => {
    try {
      const { error } = await supabase
        .from('interacciones_clientes')
        .insert([interaccion]);
      
      if (error) throw error;
      
      await fetchInteracciones();
      toast.success('Interacción registrada');
    } catch (error) {
      console.error('Error creating interaction:', error);
      toast.error('Error al crear interacción');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPipeline(),
        fetchTareas(),
        fetchInteracciones()
      ]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  return {
    pipeline,
    tareas,
    interacciones,
    loading,
    updatePipelineStatus,
    completarTarea,
    crearTarea,
    crearInteraccion,
    refetch: () => Promise.all([fetchPipeline(), fetchTareas(), fetchInteracciones()])
  };
};