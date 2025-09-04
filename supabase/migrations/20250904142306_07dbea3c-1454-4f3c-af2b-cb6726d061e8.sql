-- Update proveedores table with additional fields
ALTER TABLE public.proveedores 
ADD COLUMN especialidad TEXT,
ADD COLUMN tipo_proveedor TEXT DEFAULT 'productos',
ADD COLUMN activo BOOLEAN DEFAULT true,
ADD COLUMN direccion TEXT,
ADD COLUMN notas TEXT;

-- Create compras_proveedores table for purchase history
CREATE TABLE public.compras_proveedores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proveedor_id UUID NOT NULL REFERENCES public.proveedores(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  numero_factura TEXT,
  concepto TEXT NOT NULL,
  monto_total NUMERIC NOT NULL DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagada', 'vencida')),
  fecha_vencimiento DATE,
  fecha_pago DATE,
  metodo_pago TEXT CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia', 'cheque')),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pagos_proveedores table for payment history  
CREATE TABLE public.pagos_proveedores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proveedor_id UUID NOT NULL REFERENCES public.proveedores(id) ON DELETE CASCADE,
  compra_id UUID REFERENCES public.compras_proveedores(id) ON DELETE SET NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  monto NUMERIC NOT NULL DEFAULT 0,
  metodo_pago TEXT NOT NULL DEFAULT 'efectivo' CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia', 'cheque')),
  numero_referencia TEXT,
  concepto TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.compras_proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos_proveedores ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on compras_proveedores" 
ON public.compras_proveedores 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on pagos_proveedores" 
ON public.pagos_proveedores 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create triggers for timestamps
CREATE TRIGGER update_compras_proveedores_updated_at
BEFORE UPDATE ON public.compras_proveedores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pagos_proveedores_updated_at
BEFORE UPDATE ON public.pagos_proveedores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();