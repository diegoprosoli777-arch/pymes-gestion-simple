-- ===============================================
-- NUEVAS TABLAS PARA FUNCIONALIDADES COMPLETAS
-- ===============================================

-- Pipeline de clientes (CRM)
CREATE TABLE public.pipeline_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  estado TEXT NOT NULL DEFAULT 'prospecto', -- prospecto, negociacion, ganado, perdido
  valor_estimado NUMERIC DEFAULT 0,
  probabilidad INTEGER DEFAULT 50, -- 0-100%
  fecha_cambio_estado DATE DEFAULT CURRENT_DATE,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tareas y recordatorios para clientes
CREATE TABLE public.tareas_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL DEFAULT 'llamada', -- llamada, reunion, seguimiento, email
  fecha_vencimiento TIMESTAMP WITH TIME ZONE,
  completada BOOLEAN DEFAULT FALSE,
  fecha_completado TIMESTAMP WITH TIME ZONE,
  prioridad TEXT DEFAULT 'media', -- alta, media, baja
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Historial de interacciones con clientes
CREATE TABLE public.interacciones_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- llamada, reunion, email, venta, nota
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Vencimientos impositivos y recordatorios
CREATE TABLE public.vencimientos_impositivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL, -- "IVA Mensual", "Ganancias", etc
  descripcion TEXT,
  fecha_vencimiento DATE NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'mensual', -- mensual, anual, trimestral
  monto_estimado NUMERIC DEFAULT 0,
  completado BOOLEAN DEFAULT FALSE,
  fecha_completado DATE,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Presupuestos mensuales
CREATE TABLE public.presupuestos_mensuales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  año INTEGER NOT NULL,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ingresos_esperados NUMERIC DEFAULT 0,
  gastos_esperados NUMERIC DEFAULT 0,
  objetivo_ventas NUMERIC DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(año, mes)
);

-- Categorías de gastos para mejor análisis fiscal
ALTER TABLE public.gastos ADD COLUMN categoria_fiscal TEXT DEFAULT 'operativo';
-- Categorías: operativo, insumos, servicios, impuestos, marketing, personal

-- Agregar campos adicionales a ventas para análisis
ALTER TABLE public.ventas ADD COLUMN descuento NUMERIC DEFAULT 0;
ALTER TABLE public.ventas ADD COLUMN impuesto NUMERIC DEFAULT 0;
ALTER TABLE public.ventas ADD COLUMN fecha_vencimiento DATE;
ALTER TABLE public.ventas ADD COLUMN fecha_cobro DATE;

-- ===============================================
-- ÍNDICES PARA PERFORMANCE
-- ===============================================

CREATE INDEX idx_pipeline_clientes_cliente_id ON public.pipeline_clientes(cliente_id);
CREATE INDEX idx_pipeline_clientes_estado ON public.pipeline_clientes(estado);
CREATE INDEX idx_tareas_clientes_cliente_id ON public.tareas_clientes(cliente_id);
CREATE INDEX idx_tareas_clientes_fecha ON public.tareas_clientes(fecha_vencimiento);
CREATE INDEX idx_tareas_clientes_completada ON public.tareas_clientes(completada);
CREATE INDEX idx_interacciones_cliente_id ON public.interacciones_clientes(cliente_id);
CREATE INDEX idx_vencimientos_fecha ON public.vencimientos_impositivos(fecha_vencimiento);
CREATE INDEX idx_presupuestos_año_mes ON public.presupuestos_mensuales(año, mes);

-- ===============================================
-- POLÍTICAS RLS PARA TODAS LAS NUEVAS TABLAS
-- ===============================================

-- Pipeline clientes
ALTER TABLE public.pipeline_clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on pipeline_clientes" ON public.pipeline_clientes FOR ALL USING (true) WITH CHECK (true);

-- Tareas clientes
ALTER TABLE public.tareas_clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on tareas_clientes" ON public.tareas_clientes FOR ALL USING (true) WITH CHECK (true);

-- Interacciones clientes
ALTER TABLE public.interacciones_clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on interacciones_clientes" ON public.interacciones_clientes FOR ALL USING (true) WITH CHECK (true);

-- Vencimientos impositivos
ALTER TABLE public.vencimientos_impositivos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on vencimientos_impositivos" ON public.vencimientos_impositivos FOR ALL USING (true) WITH CHECK (true);

-- Presupuestos mensuales
ALTER TABLE public.presupuestos_mensuales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on presupuestos_mensuales" ON public.presupuestos_mensuales FOR ALL USING (true) WITH CHECK (true);

-- ===============================================
-- TRIGGERS PARA UPDATED_AT
-- ===============================================

CREATE TRIGGER update_pipeline_clientes_updated_at
  BEFORE UPDATE ON public.pipeline_clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tareas_clientes_updated_at
  BEFORE UPDATE ON public.tareas_clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vencimientos_impositivos_updated_at
  BEFORE UPDATE ON public.vencimientos_impositivos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_presupuestos_mensuales_updated_at
  BEFORE UPDATE ON public.presupuestos_mensuales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ===============================================
-- DATOS INICIALES
-- ===============================================

-- Datos de ejemplo para pipeline
INSERT INTO public.pipeline_clientes (cliente_id, estado, valor_estimado, probabilidad, notas) VALUES
((SELECT id FROM public.clientes WHERE nombre ILIKE '%Juan%' LIMIT 1), 'ganado', 25000, 100, 'Cliente convertido exitosamente'),
((SELECT id FROM public.clientes WHERE nombre ILIKE '%María%' LIMIT 1), 'negociacion', 15000, 75, 'En proceso de negociación de precios'),
((SELECT id FROM public.clientes WHERE nombre ILIKE '%Roberto%' LIMIT 1), 'prospecto', 8000, 25, 'Primer contacto realizado');

-- Tareas de ejemplo
INSERT INTO public.tareas_clientes (cliente_id, titulo, descripcion, tipo, fecha_vencimiento, prioridad) VALUES
((SELECT id FROM public.clientes WHERE nombre ILIKE '%Juan%' LIMIT 1), 'Llamada de seguimiento post-venta', 'Verificar satisfacción del cliente', 'llamada', now() + interval '3 days', 'media'),
((SELECT id FROM public.clientes WHERE nombre ILIKE '%María%' LIMIT 1), 'Reunión de cierre', 'Cerrar negociación pendiente', 'reunion', now() + interval '1 day', 'alta'),
((SELECT id FROM public.clientes WHERE nombre ILIKE '%Roberto%' LIMIT 1), 'Envío de propuesta', 'Enviar propuesta comercial por email', 'email', now() + interval '2 days', 'alta');

-- Vencimientos impositivos
INSERT INTO public.vencimientos_impositivos (nombre, descripcion, fecha_vencimiento, tipo, monto_estimado) VALUES
('IVA Febrero 2025', 'Declaración jurada y pago de IVA del mes de enero', '2025-02-20', 'mensual', 15000),
('Ingresos Brutos Febrero', 'Pago de Ingresos Brutos correspondiente a enero', '2025-02-10', 'mensual', 8000),
('Ganancias 2024', 'Declaración anual de Impuesto a las Ganancias', '2025-04-30', 'anual', 50000);

-- Presupuesto para los próximos meses
INSERT INTO public.presupuestos_mensuales (año, mes, ingresos_esperados, gastos_esperados, objetivo_ventas, notas) VALUES
(2025, 2, 150000, 80000, 140000, 'Febrero - Meta conservadora post-enero'),
(2025, 3, 180000, 90000, 170000, 'Marzo - Incremento esperado del 20%'),
(2025, 4, 200000, 95000, 190000, 'Abril - Meta ambiciosa segundo trimestre');