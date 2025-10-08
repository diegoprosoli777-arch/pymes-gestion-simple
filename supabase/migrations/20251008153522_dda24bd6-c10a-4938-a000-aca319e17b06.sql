-- Phase 1: Fix Critical Data Exposure - Backfill NULL user_ids then make NOT NULL

-- Step 1: Backfill NULL user_id records with the first available user
-- This assigns orphaned records to an existing user
DO $$
DECLARE
  first_user_id uuid;
BEGIN
  -- Get the first user ID
  SELECT id INTO first_user_id FROM auth.users LIMIT 1;
  
  IF first_user_id IS NOT NULL THEN
    -- Update all tables with NULL user_id
    UPDATE public.clientes SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE public.productos SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE public.ventas SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE public.gastos SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE public.proveedores SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE public.compras_proveedores SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE public.pagos_proveedores SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE public.presupuestos_mensuales SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE public.vencimientos_impositivos SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE public.pipeline_clientes SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE public.tareas_clientes SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE public.interacciones_clientes SET user_id = first_user_id WHERE user_id IS NULL;
  END IF;
END $$;

-- Step 2: Add NOT NULL constraints and default values to all user_id columns
ALTER TABLE public.clientes 
  ALTER COLUMN user_id SET DEFAULT auth.uid(),
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.productos 
  ALTER COLUMN user_id SET DEFAULT auth.uid(),
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.ventas 
  ALTER COLUMN user_id SET DEFAULT auth.uid(),
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.gastos 
  ALTER COLUMN user_id SET DEFAULT auth.uid(),
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.proveedores 
  ALTER COLUMN user_id SET DEFAULT auth.uid(),
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.compras_proveedores 
  ALTER COLUMN user_id SET DEFAULT auth.uid(),
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.pagos_proveedores 
  ALTER COLUMN user_id SET DEFAULT auth.uid(),
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.presupuestos_mensuales 
  ALTER COLUMN user_id SET DEFAULT auth.uid(),
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.vencimientos_impositivos 
  ALTER COLUMN user_id SET DEFAULT auth.uid(),
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.pipeline_clientes 
  ALTER COLUMN user_id SET DEFAULT auth.uid(),
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.tareas_clientes 
  ALTER COLUMN user_id SET DEFAULT auth.uid(),
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.interacciones_clientes 
  ALTER COLUMN user_id SET DEFAULT auth.uid(),
  ALTER COLUMN user_id SET NOT NULL;

-- Step 3: Add database-level validation functions
CREATE OR REPLACE FUNCTION validate_email(email text)
RETURNS boolean AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION validate_cuit_dni(cuit_dni text)
RETURNS boolean AS $$
BEGIN
  -- Argentine CUIT/DNI format: 8-11 digits, optionally with hyphens
  RETURN cuit_dni IS NULL OR cuit_dni ~ '^\d{8,11}$' OR cuit_dni ~ '^\d{2}-\d{7,8}-\d$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 4: Add check constraints for data validation
ALTER TABLE public.clientes 
  ADD CONSTRAINT clientes_email_valid 
  CHECK (email IS NULL OR validate_email(email));

ALTER TABLE public.proveedores 
  ADD CONSTRAINT proveedores_email_valid 
  CHECK (email IS NULL OR validate_email(email)),
  ADD CONSTRAINT proveedores_cuit_dni_valid
  CHECK (validate_cuit_dni(cuit_dni));

-- Step 5: Add constraints for numeric fields to prevent negative values
ALTER TABLE public.productos
  ADD CONSTRAINT productos_precio_positive CHECK (precio >= 0),
  ADD CONSTRAINT productos_costo_positive CHECK (costo >= 0),
  ADD CONSTRAINT productos_stock_non_negative CHECK (stock_actual >= 0),
  ADD CONSTRAINT productos_stock_minimo_non_negative CHECK (stock_minimo >= 0);

ALTER TABLE public.ventas
  ADD CONSTRAINT ventas_monto_positive CHECK (monto_total >= 0);

ALTER TABLE public.gastos
  ADD CONSTRAINT gastos_monto_positive CHECK (monto >= 0);

ALTER TABLE public.compras_proveedores
  ADD CONSTRAINT compras_monto_positive CHECK (monto_total >= 0);

ALTER TABLE public.pagos_proveedores
  ADD CONSTRAINT pagos_monto_positive CHECK (monto >= 0);