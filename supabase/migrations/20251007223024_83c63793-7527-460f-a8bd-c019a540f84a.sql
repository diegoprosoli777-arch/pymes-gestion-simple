-- Add user_id to all main tables
ALTER TABLE public.clientes ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.productos ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.ventas ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.gastos ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.proveedores ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.compras_proveedores ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.pagos_proveedores ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.presupuestos_mensuales ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.vencimientos_impositivos ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.pipeline_clientes ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.tareas_clientes ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.interacciones_clientes ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow all operations on clientes" ON public.clientes;
DROP POLICY IF EXISTS "Allow all operations on productos" ON public.productos;
DROP POLICY IF EXISTS "Allow all operations on ventas" ON public.ventas;
DROP POLICY IF EXISTS "Allow all operations on gastos" ON public.gastos;
DROP POLICY IF EXISTS "Allow all operations on proveedores" ON public.proveedores;
DROP POLICY IF EXISTS "Allow all operations on compras_proveedores" ON public.compras_proveedores;
DROP POLICY IF EXISTS "Allow all operations on pagos_proveedores" ON public.pagos_proveedores;
DROP POLICY IF EXISTS "Allow all operations on presupuestos_mensuales" ON public.presupuestos_mensuales;
DROP POLICY IF EXISTS "Allow all operations on vencimientos_impositivos" ON public.vencimientos_impositivos;
DROP POLICY IF EXISTS "Allow all operations on pipeline_clientes" ON public.pipeline_clientes;
DROP POLICY IF EXISTS "Allow all operations on tareas_clientes" ON public.tareas_clientes;
DROP POLICY IF EXISTS "Allow all operations on interacciones_clientes" ON public.interacciones_clientes;
DROP POLICY IF EXISTS "Allow all operations on ventas_items" ON public.ventas_items;

-- Create RLS policies for user-specific data
-- Clientes
CREATE POLICY "Users can view own clientes" ON public.clientes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clientes" ON public.clientes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clientes" ON public.clientes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clientes" ON public.clientes FOR DELETE USING (auth.uid() = user_id);

-- Productos
CREATE POLICY "Users can view own productos" ON public.productos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own productos" ON public.productos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own productos" ON public.productos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own productos" ON public.productos FOR DELETE USING (auth.uid() = user_id);

-- Ventas
CREATE POLICY "Users can view own ventas" ON public.ventas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ventas" ON public.ventas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ventas" ON public.ventas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ventas" ON public.ventas FOR DELETE USING (auth.uid() = user_id);

-- Ventas items (relacionado con ventas)
CREATE POLICY "Users can view own ventas_items" ON public.ventas_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.ventas WHERE ventas.id = ventas_items.venta_id AND ventas.user_id = auth.uid())
);
CREATE POLICY "Users can insert own ventas_items" ON public.ventas_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.ventas WHERE ventas.id = ventas_items.venta_id AND ventas.user_id = auth.uid())
);
CREATE POLICY "Users can update own ventas_items" ON public.ventas_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.ventas WHERE ventas.id = ventas_items.venta_id AND ventas.user_id = auth.uid())
);
CREATE POLICY "Users can delete own ventas_items" ON public.ventas_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.ventas WHERE ventas.id = ventas_items.venta_id AND ventas.user_id = auth.uid())
);

-- Gastos
CREATE POLICY "Users can view own gastos" ON public.gastos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gastos" ON public.gastos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gastos" ON public.gastos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own gastos" ON public.gastos FOR DELETE USING (auth.uid() = user_id);

-- Proveedores
CREATE POLICY "Users can view own proveedores" ON public.proveedores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own proveedores" ON public.proveedores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own proveedores" ON public.proveedores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own proveedores" ON public.proveedores FOR DELETE USING (auth.uid() = user_id);

-- Compras Proveedores
CREATE POLICY "Users can view own compras_proveedores" ON public.compras_proveedores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own compras_proveedores" ON public.compras_proveedores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own compras_proveedores" ON public.compras_proveedores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own compras_proveedores" ON public.compras_proveedores FOR DELETE USING (auth.uid() = user_id);

-- Pagos Proveedores
CREATE POLICY "Users can view own pagos_proveedores" ON public.pagos_proveedores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pagos_proveedores" ON public.pagos_proveedores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pagos_proveedores" ON public.pagos_proveedores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pagos_proveedores" ON public.pagos_proveedores FOR DELETE USING (auth.uid() = user_id);

-- Presupuestos Mensuales
CREATE POLICY "Users can view own presupuestos" ON public.presupuestos_mensuales FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own presupuestos" ON public.presupuestos_mensuales FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own presupuestos" ON public.presupuestos_mensuales FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own presupuestos" ON public.presupuestos_mensuales FOR DELETE USING (auth.uid() = user_id);

-- Vencimientos Impositivos
CREATE POLICY "Users can view own vencimientos" ON public.vencimientos_impositivos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vencimientos" ON public.vencimientos_impositivos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vencimientos" ON public.vencimientos_impositivos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vencimientos" ON public.vencimientos_impositivos FOR DELETE USING (auth.uid() = user_id);

-- Pipeline Clientes
CREATE POLICY "Users can view own pipeline" ON public.pipeline_clientes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pipeline" ON public.pipeline_clientes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pipeline" ON public.pipeline_clientes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pipeline" ON public.pipeline_clientes FOR DELETE USING (auth.uid() = user_id);

-- Tareas Clientes
CREATE POLICY "Users can view own tareas" ON public.tareas_clientes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tareas" ON public.tareas_clientes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tareas" ON public.tareas_clientes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tareas" ON public.tareas_clientes FOR DELETE USING (auth.uid() = user_id);

-- Interacciones Clientes
CREATE POLICY "Users can view own interacciones" ON public.interacciones_clientes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own interacciones" ON public.interacciones_clientes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own interacciones" ON public.interacciones_clientes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own interacciones" ON public.interacciones_clientes FOR DELETE USING (auth.uid() = user_id);