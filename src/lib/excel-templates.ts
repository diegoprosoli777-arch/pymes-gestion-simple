import * as XLSX from 'xlsx';

// Plantillas mejoradas para Excel con formato y estilos

export const exportVentasReportTemplate = (ventas: any[], clientes: any[], productos: any[]) => {
  // Crear workbook
  const workbook = XLSX.utils.book_new();
  
  // Hoja de resumen
  const resumenData = [
    ['REPORTE DE VENTAS'],
    ['Fecha de generación:', new Date().toLocaleDateString()],
    [''],
    ['RESUMEN EJECUTIVO'],
    ['Total de ventas:', `$${ventas.reduce((sum, v) => sum + v.monto_total, 0).toLocaleString()}`],
    ['Número de transacciones:', ventas.length],
    ['Ventas cobradas:', ventas.filter(v => v.estado === 'cobrada').length],
    ['Ventas pendientes:', ventas.filter(v => v.estado === 'pendiente').length],
    [''],
    ['POR MÉTODO DE PAGO'],
    ['Efectivo:', ventas.filter(v => v.metodo_pago === 'efectivo').length],
    ['Tarjeta:', ventas.filter(v => v.metodo_pago === 'tarjeta').length],
    ['Transferencia:', ventas.filter(v => v.metodo_pago === 'transferencia').length],
  ];
  
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');
  
  // Hoja de detalle de ventas
  const ventasDetalle = ventas.map(venta => {
    const cliente = clientes.find(c => c.id === venta.cliente_id);
    return {
      'ID Venta': venta.id.slice(-8),
      'Fecha': venta.fecha,
      'Cliente': cliente?.nombre || 'N/A',
      'Empresa': cliente?.empresa || 'N/A',
      'Monto Total': venta.monto_total,
      'Método de Pago': venta.metodo_pago,
      'Estado': venta.estado,
      'Descuento': venta.descuento || 0,
      'Impuesto': venta.impuesto || 0,
      'Fecha Vencimiento': venta.fecha_vencimiento || 'N/A',
      'Fecha Cobro': venta.fecha_cobro || 'N/A'
    };
  });
  
  const wsVentas = XLSX.utils.json_to_sheet(ventasDetalle);
  XLSX.utils.book_append_sheet(workbook, wsVentas, 'Detalle de Ventas');
  
  // Hoja de análisis por cliente
  const ventasPorCliente = clientes.map(cliente => {
    const ventasCliente = ventas.filter(v => v.cliente_id === cliente.id);
    const totalVentas = ventasCliente.reduce((sum, v) => sum + v.monto_total, 0);
    
    return {
      'Cliente': cliente.nombre,
      'Empresa': cliente.empresa || 'N/A',
      'Total Ventas': totalVentas,
      'Número de Compras': ventasCliente.length,
      'Promedio por Compra': ventasCliente.length > 0 ? totalVentas / ventasCliente.length : 0,
      'Estado Cliente': cliente.estado
    };
  }).filter(cliente => cliente['Número de Compras'] > 0)
    .sort((a, b) => b['Total Ventas'] - a['Total Ventas']);
  
  const wsClientes = XLSX.utils.json_to_sheet(ventasPorCliente);
  XLSX.utils.book_append_sheet(workbook, wsClientes, 'Análisis por Cliente');
  
  // Guardar archivo
  XLSX.writeFile(workbook, `Reporte_Ventas_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportProductosReportTemplate = (productos: any[]) => {
  const workbook = XLSX.utils.book_new();
  
  // Hoja de resumen
  const totalProductos = productos.length;
  const stockBajo = productos.filter(p => p.stock_actual <= p.stock_minimo).length;
  const valorInventario = productos.reduce((sum, p) => sum + (p.stock_actual * p.costo), 0);
  
  const resumenData = [
    ['REPORTE DE PRODUCTOS E INVENTARIO'],
    ['Fecha de generación:', new Date().toLocaleDateString()],
    [''],
    ['RESUMEN EJECUTIVO'],
    ['Total de productos:', totalProductos],
    ['Productos con stock bajo:', stockBajo],
    ['Valor total del inventario:', `$${valorInventario.toLocaleString()}`],
    [''],
    ['ALERTAS'],
    stockBajo > 0 ? [`${stockBajo} productos necesitan reposición`] : ['Todos los productos tienen stock adecuado'],
  ];
  
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');
  
  // Hoja de productos detallada
  const productosDetalle = productos.map(producto => ({
    'Código': producto.id.slice(-8),
    'Nombre': producto.nombre,
    'Categoría': producto.categoria,
    'Costo': producto.costo,
    'Precio de Venta': producto.precio,
    'Margen (%)': ((producto.precio - producto.costo) / producto.precio * 100).toFixed(1),
    'Margen ($)': producto.precio - producto.costo,
    'Stock Actual': producto.stock_actual,
    'Stock Mínimo': producto.stock_minimo,
    'Estado Stock': producto.stock_actual <= producto.stock_minimo ? 'BAJO' : 'OK',
    'Valor Inventario': producto.stock_actual * producto.costo,
    'Fecha Registro': producto.created_at ? new Date(producto.created_at).toLocaleDateString() : 'N/A'
  }));
  
  const wsProductos = XLSX.utils.json_to_sheet(productosDetalle);
  XLSX.utils.book_append_sheet(workbook, wsProductos, 'Inventario Detallado');
  
  // Hoja de productos con stock bajo
  const stockBajoData = productos
    .filter(p => p.stock_actual <= p.stock_minimo)
    .map(producto => ({
      'Producto': producto.nombre,
      'Stock Actual': producto.stock_actual,
      'Stock Mínimo': producto.stock_minimo,
      'Déficit': producto.stock_minimo - producto.stock_actual,
      'Costo Unitario': producto.costo,
      'Costo Reposición': (producto.stock_minimo - producto.stock_actual) * producto.costo
    }));
  
  if (stockBajoData.length > 0) {
    const wsStockBajo = XLSX.utils.json_to_sheet(stockBajoData);
    XLSX.utils.book_append_sheet(workbook, wsStockBajo, 'Stock Bajo');
  }
  
  XLSX.writeFile(workbook, `Reporte_Productos_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportClientesReportTemplate = (clientes: any[], ventas: any[] = []) => {
  const workbook = XLSX.utils.book_new();
  
  // Hoja de resumen
  const totalClientes = clientes.length;
  const clientesActivos = clientes.filter(c => c.estado === 'activo').length;
  const prospectos = clientes.filter(c => c.estado === 'prospecto').length;
  
  const resumenData = [
    ['REPORTE DE CLIENTES'],
    ['Fecha de generación:', new Date().toLocaleDateString()],
    [''],
    ['RESUMEN EJECUTIVO'],
    ['Total de clientes:', totalClientes],
    ['Clientes activos:', clientesActivos],
    ['Prospectos:', prospectos],
    ['Clientes inactivos:', clientes.filter(c => c.estado === 'inactivo').length],
  ];
  
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');
  
  // Hoja de clientes detallada con análisis de ventas
  const clientesDetalle = clientes.map(cliente => {
    const ventasCliente = ventas.filter(v => v.cliente_id === cliente.id);
    const totalVentas = ventasCliente.reduce((sum, v) => sum + v.monto_total, 0);
    const ultimaVenta = ventasCliente.length > 0 
      ? ventasCliente.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0].fecha
      : 'Nunca';
    
    return {
      'Nombre': cliente.nombre,
      'Email': cliente.email || 'N/A',
      'Teléfono': cliente.telefono || 'N/A',
      'Empresa': cliente.empresa || 'N/A',
      'Estado': cliente.estado,
      'Fecha Registro': new Date(cliente.created_at).toLocaleDateString(),
      'Total Compras ($)': totalVentas,
      'Número de Compras': ventasCliente.length,
      'Promedio por Compra': ventasCliente.length > 0 ? totalVentas / ventasCliente.length : 0,
      'Última Compra': ultimaVenta,
      'Notas': cliente.notas || 'N/A'
    };
  });
  
  const wsClientes = XLSX.utils.json_to_sheet(clientesDetalle);
  XLSX.utils.book_append_sheet(workbook, wsClientes, 'Clientes Detallado');
  
  // Top clientes por ventas
  const topClientes = clientesDetalle
    .filter(c => c['Número de Compras'] > 0)
    .sort((a, b) => b['Total Compras ($)'] - a['Total Compras ($)'])
    .slice(0, 20)
    .map((cliente, index) => ({
      'Ranking': index + 1,
      'Cliente': cliente.Nombre,
      'Empresa': cliente.Empresa,
      'Total Ventas': cliente['Total Compras ($)'],
      'Número Compras': cliente['Número de Compras'],
      'Promedio': cliente['Promedio por Compra']
    }));
  
  if (topClientes.length > 0) {
    const wsTop = XLSX.utils.json_to_sheet(topClientes);
    XLSX.utils.book_append_sheet(workbook, wsTop, 'Top Clientes');
  }
  
  XLSX.writeFile(workbook, `Reporte_Clientes_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportGastosReportTemplate = (gastos: any[]) => {
  const workbook = XLSX.utils.book_new();
  
  // Hoja de resumen
  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);
  const gastosPorTipo = {
    operativo: gastos.filter(g => g.tipo === 'operativo').reduce((sum, g) => sum + g.monto, 0),
    insumo: gastos.filter(g => g.tipo === 'insumo').reduce((sum, g) => sum + g.monto, 0),
    otro: gastos.filter(g => g.tipo === 'otro').reduce((sum, g) => sum + g.monto, 0)
  };
  
  const resumenData = [
    ['REPORTE DE GASTOS'],
    ['Fecha de generación:', new Date().toLocaleDateString()],
    [''],
    ['RESUMEN EJECUTIVO'],
    ['Total de gastos:', `$${totalGastos.toLocaleString()}`],
    ['Número de transacciones:', gastos.length],
    [''],
    ['POR TIPO DE GASTO'],
    ['Gastos operativos:', `$${gastosPorTipo.operativo.toLocaleString()}`],
    ['Gastos en insumos:', `$${gastosPorTipo.insumo.toLocaleString()}`],
    ['Otros gastos:', `$${gastosPorTipo.otro.toLocaleString()}`],
  ];
  
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');
  
  // Hoja de gastos detallada
  const gastosDetalle = gastos.map(gasto => ({
    'ID': gasto.id.slice(-8),
    'Fecha': gasto.fecha,
    'Proveedor': gasto.proveedor,
    'Monto': gasto.monto,
    'Tipo': gasto.tipo,
    'Categoría Fiscal': gasto.categoria_fiscal || 'N/A',
    'Notas': gasto.notas || 'N/A',
    'Fecha Registro': new Date(gasto.created_at).toLocaleDateString()
  }));
  
  const wsGastos = XLSX.utils.json_to_sheet(gastosDetalle);
  XLSX.utils.book_append_sheet(workbook, wsGastos, 'Gastos Detallado');
  
  // Análisis por proveedor
  const proveedores = [...new Set(gastos.map(g => g.proveedor))];
  const analisisProveedores = proveedores.map(proveedor => {
    const gastosProveedor = gastos.filter(g => g.proveedor === proveedor);
    const total = gastosProveedor.reduce((sum, g) => sum + g.monto, 0);
    
    return {
      'Proveedor': proveedor,
      'Total Gastado': total,
      'Número de Transacciones': gastosProveedor.length,
      'Promedio por Transacción': total / gastosProveedor.length,
      'Último Gasto': gastosProveedor.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0].fecha
    };
  }).sort((a, b) => b['Total Gastado'] - a['Total Gastado']);
  
  const wsProveedores = XLSX.utils.json_to_sheet(analisisProveedores);
  XLSX.utils.book_append_sheet(workbook, wsProveedores, 'Análisis Proveedores');
  
  XLSX.writeFile(workbook, `Reporte_Gastos_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportFinancieroReportTemplate = (
  ventas: any[], 
  gastos: any[], 
  flujoCaja: any[], 
  kpis: any
) => {
  const workbook = XLSX.utils.book_new();
  
  // Hoja de resumen ejecutivo
  const totalIngresos = ventas.reduce((sum, v) => sum + v.monto_total, 0);
  const totalEgresos = gastos.reduce((sum, g) => sum + g.monto, 0);
  const balance = totalIngresos - totalEgresos;
  
  const resumenData = [
    ['REPORTE FINANCIERO COMPLETO'],
    ['Fecha de generación:', new Date().toLocaleDateString()],
    [''],
    ['RESUMEN EJECUTIVO'],
    ['Total Ingresos:', `$${totalIngresos.toLocaleString()}`],
    ['Total Egresos:', `$${totalEgresos.toLocaleString()}`],
    ['Balance Neto:', `$${balance.toLocaleString()}`],
    ['Margen (%):', `${(balance / totalIngresos * 100).toFixed(1)}%`],
    [''],
    ['KPIS FINANCIEROS'],
    ['Días promedio de cobro:', `${kpis.diasPromedioCobro} días`],
    ['Días promedio de pago:', `${kpis.diasPromedioPago} días`],
    ['Liquidez actual:', `${kpis.liquidezActual.toFixed(1)}%`],
    ['Ventas por cobrar:', `$${kpis.ventasPorCobrar.toLocaleString()}`],
    ['Gastos por pagar:', `$${kpis.gastosPorPagar.toLocaleString()}`],
  ];
  
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen Ejecutivo');
  
  // Hoja de flujo de caja
  const flujoCajaData = flujoCaja.map(flujo => ({
    'Mes': flujo.mes,
    'Ingresos': flujo.ingresos,
    'Egresos': flujo.egresos,
    'Balance del Mes': flujo.balance,
    'Balance Acumulado': flujo.acumulado
  }));
  
  const wsFlujo = XLSX.utils.json_to_sheet(flujoCajaData);
  XLSX.utils.book_append_sheet(workbook, wsFlujo, 'Flujo de Caja');
  
  // Hoja de análisis mensual
  const meses = [...new Set(ventas.map(v => v.fecha.substring(0, 7)))].sort();
  const analisisMensual = meses.map(mes => {
    const ventasMes = ventas.filter(v => v.fecha.startsWith(mes));
    const gastosMes = gastos.filter(g => g.fecha.startsWith(mes));
    const ingresosMes = ventasMes.reduce((sum, v) => sum + v.monto_total, 0);
    const egresosMes = gastosMes.reduce((sum, g) => sum + g.monto, 0);
    
    return {
      'Mes': mes,
      'Ingresos': ingresosMes,
      'Egresos': egresosMes,
      'Balance': ingresosMes - egresosMes,
      'Número Ventas': ventasMes.length,
      'Número Gastos': gastosMes.length,
      'Promedio por Venta': ventasMes.length > 0 ? ingresosMes / ventasMes.length : 0
    };
  });
  
  const wsMensual = XLSX.utils.json_to_sheet(analisisMensual);
  XLSX.utils.book_append_sheet(workbook, wsMensual, 'Análisis Mensual');
  
  XLSX.writeFile(workbook, `Reporte_Financiero_${new Date().toISOString().split('T')[0]}.xlsx`);
};