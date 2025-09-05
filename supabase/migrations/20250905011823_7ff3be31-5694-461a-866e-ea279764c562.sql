-- Add missing fields to proveedores table
ALTER TABLE public.proveedores 
ADD COLUMN IF NOT EXISTS cuit_dni TEXT,
ADD COLUMN IF NOT EXISTS calle TEXT,
ADD COLUMN IF NOT EXISTS numero TEXT,
ADD COLUMN IF NOT EXISTS ciudad TEXT,
ADD COLUMN IF NOT EXISTS provincia TEXT,
ADD COLUMN IF NOT EXISTS codigo_postal TEXT,
ADD COLUMN IF NOT EXISTS rubro TEXT,
ADD COLUMN IF NOT EXISTS notas_internas TEXT;

-- Update existing especialidad column to be more descriptive
COMMENT ON COLUMN public.proveedores.especialidad IS 'Productos o servicios que provee';
COMMENT ON COLUMN public.proveedores.rubro IS 'Categoría del proveedor (insumos, logística, servicios, etc.)';

-- Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_proveedores_nombre ON public.proveedores USING gin(to_tsvector('spanish', nombre));
CREATE INDEX IF NOT EXISTS idx_proveedores_empresa ON public.proveedores USING gin(to_tsvector('spanish', empresa));
CREATE INDEX IF NOT EXISTS idx_proveedores_rubro ON public.proveedores(rubro);
CREATE INDEX IF NOT EXISTS idx_proveedores_ciudad ON public.proveedores(ciudad);

-- Ensure compras_proveedores has proper foreign key constraints
ALTER TABLE public.compras_proveedores 
ADD CONSTRAINT fk_compras_proveedor 
FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(id) ON DELETE CASCADE;

-- Ensure pagos_proveedores has proper foreign key constraints  
ALTER TABLE public.pagos_proveedores 
ADD CONSTRAINT fk_pagos_proveedor 
FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(id) ON DELETE CASCADE;

ALTER TABLE public.pagos_proveedores 
ADD CONSTRAINT fk_pagos_compra 
FOREIGN KEY (compra_id) REFERENCES public.compras_proveedores(id) ON DELETE SET NULL;