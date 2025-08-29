-- Create productos table
CREATE TABLE public.productos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  costo DECIMAL(10,2) NOT NULL DEFAULT 0,
  precio DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock_actual INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 0,
  categoria TEXT NOT NULL DEFAULT 'General',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clientes table
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  empresa TEXT,
  estado TEXT NOT NULL DEFAULT 'prospecto' CHECK (estado IN ('prospecto', 'activo', 'inactivo')),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ventas table
CREATE TABLE public.ventas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  monto_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  metodo_pago TEXT NOT NULL DEFAULT 'efectivo' CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia')),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('cobrada', 'pendiente')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ventas_items table
CREATE TABLE public.ventas_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venta_id UUID NOT NULL REFERENCES public.ventas(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gastos table
CREATE TABLE public.gastos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  proveedor TEXT NOT NULL,
  monto DECIMAL(10,2) NOT NULL DEFAULT 0,
  tipo TEXT NOT NULL DEFAULT 'operativo' CHECK (tipo IN ('operativo', 'insumo', 'otro')),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all operations for now - can be restricted later)
CREATE POLICY "Allow all operations on productos" ON public.productos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on clientes" ON public.clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on ventas" ON public.ventas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on ventas_items" ON public.ventas_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on gastos" ON public.gastos FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_productos_updated_at
  BEFORE UPDATE ON public.productos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ventas_updated_at
  BEFORE UPDATE ON public.ventas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gastos_updated_at
  BEFORE UPDATE ON public.gastos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_ventas_fecha ON public.ventas(fecha);
CREATE INDEX idx_ventas_cliente_id ON public.ventas(cliente_id);
CREATE INDEX idx_ventas_items_venta_id ON public.ventas_items(venta_id);
CREATE INDEX idx_ventas_items_producto_id ON public.ventas_items(producto_id);
CREATE INDEX idx_gastos_fecha ON public.gastos(fecha);
CREATE INDEX idx_productos_categoria ON public.productos(categoria);

-- Insert sample data
INSERT INTO public.productos (nombre, costo, precio, stock_actual, stock_minimo, categoria) VALUES
('Laptop Dell Inspiron 15', 1200, 1500, 25, 10, 'Tecnología'),
('Mouse Logitech MX', 40, 50, 5, 20, 'Accesorios'),
('Teclado Mecánico RGB', 180, 300, 15, 8, 'Accesorios'),
('Monitor Samsung 27"', 350, 500, 12, 5, 'Tecnología'),
('Impresora HP LaserJet', 400, 500, 8, 6, 'Oficina');

INSERT INTO public.clientes (nombre, email, telefono, empresa, estado) VALUES
('Tech Solutions S.A.', 'info@techsolutions.com', '+1234567890', 'Tech Solutions S.A.', 'activo'),
('Innovación Digital', 'contacto@innovacion.com', '+1234567891', 'Innovación Digital', 'activo'),
('Sistemas Avanzados', 'ventas@sistemas.com', '+1234567892', 'Sistemas Avanzados', 'activo'),
('Desarrollo Móvil', 'hello@desarrollo.com', '+1234567893', 'Desarrollo Móvil', 'prospecto'),
('WebCorp Internacional', 'info@webcorp.com', '+1234567894', 'WebCorp Internacional', 'activo');