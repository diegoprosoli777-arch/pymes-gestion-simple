import * as XLSX from 'xlsx';
import { Cliente } from '@/hooks/useClientes';
import { Venta } from '@/hooks/useVentas';
import { Producto } from '@/hooks/useProductos';
import { Gasto } from '@/hooks/useGastos';
import { Proveedor, CompraProveedor, PagoProveedor } from '@/hooks/useProveedores';

export interface ExportData {
  clientes: Cliente[];
  ventas: Venta[];
  productos: Producto[];
  gastos: Gasto[];
  proveedores: Proveedor[];
  compras: CompraProveedor[];
  pagos: PagoProveedor[];
  flujoCaja?: any[];
  kpisFinancieros?: any;
}

export const exportCentralizedReport = (data: ExportData) => {
  const workbook = XLSX.utils.book_new();
  
  // Configuración de colores para títulos (azul claro)
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "4A90E2" } }, // Azul claro
    alignment: { horizontal: "center" },
    border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" }
    }
  };

  // Aplicar estilos a todas las hojas
  const applyHeaderStyles = (sheet: any, headerRow = 1) => {
    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:Z1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRow - 1, c: col });
      if (sheet[cellAddress]) {
        sheet[cellAddress].s = headerStyle;
      }
    }
  };

  // Hoja de Resumen con estilo mejorado
  const resumenData = [
    ['🏢 RESUMEN EJECUTIVO DEL NEGOCIO'],
    [''],
    ['📊 MÉTRICAS GENERALES'],
    ['Total Clientes', data.clientes.length],
    ['Total Productos', data.productos.length],
    ['Total Ventas Realizadas', data.ventas.length],
    ['Total Gastos Registrados', data.gastos.length],
    ['Total Proveedores', data.proveedores.length],
    ['Total Compras a Proveedores', data.compras.length],
    ['Total Pagos a Proveedores', data.pagos.length],
    [''],
    ['💰 ANÁLISIS FINANCIERO'],
    ['Ingresos Totales', `$${data.ventas.reduce((sum, v) => sum + v.monto_total, 0).toLocaleString()}`],
    ['Egresos Totales', `$${data.gastos.reduce((sum, g) => sum + g.monto, 0).toLocaleString()}`],
    ['Gastos en Proveedores', `$${data.compras.reduce((sum, c) => sum + c.monto_total, 0).toLocaleString()}`],
    ['Pagos a Proveedores', `$${data.pagos.reduce((sum, p) => sum + p.monto, 0).toLocaleString()}`],
    ['Ganancia Neta', `$${(data.ventas.reduce((sum, v) => sum + v.monto_total, 0) - data.gastos.reduce((sum, g) => sum + g.monto, 0)).toLocaleString()}`],
    [''],
    ['📅 INFORMACIÓN DEL REPORTE'],
    ['Generado el', new Date().toLocaleDateString('es-ES')],
    ['Hora de generación', new Date().toLocaleTimeString('es-ES')],
  ];
  const resumenSheet = XLSX.utils.aoa_to_sheet(resumenData);
  
  // Estilo para el resumen con colores
  resumenSheet['!cols'] = [{ width: 30 }, { width: 25 }];
  applyHeaderStyles(resumenSheet, 1);
  applyHeaderStyles(resumenSheet, 3);
  applyHeaderStyles(resumenSheet, 12);
  applyHeaderStyles(resumenSheet, 19);
  XLSX.utils.book_append_sheet(workbook, resumenSheet, '📊 Resumen');

  // Hoja de Clientes con mejor formato
  const clientesData = data.clientes.map(cliente => ({
    ID: cliente.id,
    Nombre: cliente.nombre,
    Email: cliente.email || '',
    Teléfono: cliente.telefono || '',
    Empresa: cliente.empresa || '',
    Estado: cliente.estado,
    'Total Compras': `$${data.ventas
      .filter(v => v.cliente_id === cliente.id)
      .reduce((sum, v) => sum + v.monto_total, 0)
      .toLocaleString()}`,
    'Número de Compras': data.ventas.filter(v => v.cliente_id === cliente.id).length,
    'Fecha Registro': new Date(cliente.created_at).toLocaleDateString('es-ES'),
    Notas: cliente.notas || ''
  }));
  
  const clientesSheet = XLSX.utils.json_to_sheet(clientesData);
  clientesSheet['!cols'] = [
    { width: 15 }, { width: 20 }, { width: 25 }, { width: 15 },
    { width: 20 }, { width: 12 }, { width: 15 }, { width: 12 },
    { width: 15 }, { width: 30 }
  ];
  applyHeaderStyles(clientesSheet);
  XLSX.utils.book_append_sheet(workbook, clientesSheet, '👥 Clientes');

  // Hoja de Productos/Inventario
  const productosData = data.productos.map(producto => ({
    ID: producto.id,
    Nombre: producto.nombre,
    Categoría: producto.categoria,
    'Precio Venta': `$${producto.precio.toLocaleString()}`,
    Costo: `$${producto.costo.toLocaleString()}`,
    'Margen %': `${(((producto.precio - producto.costo) / producto.precio) * 100).toFixed(1)}%`,
    'Stock Actual': producto.stock_actual,
    'Stock Mínimo': producto.stock_minimo,
    Estado: producto.stock_actual <= producto.stock_minimo ? 'STOCK BAJO' : 'OK',
    'Valor Inventario': `$${(producto.precio * producto.stock_actual).toLocaleString()}`,
    'Fecha Registro': new Date(producto.created_at).toLocaleDateString('es-ES')
  }));
  
  const productosSheet = XLSX.utils.json_to_sheet(productosData);
  productosSheet['!cols'] = [
    { width: 15 }, { width: 25 }, { width: 15 }, { width: 12 },
    { width: 12 }, { width: 10 }, { width: 12 }, { width: 12 },
    { width: 12 }, { width: 15 }, { width: 15 }
  ];
  applyHeaderStyles(productosSheet);
  XLSX.utils.book_append_sheet(workbook, productosSheet, '📦 Inventario');

  // Hoja de Ventas
  const ventasData = data.ventas.map(venta => {
    const cliente = data.clientes.find(c => c.id === venta.cliente_id);
    return {
      ID: venta.id,
      Fecha: new Date(venta.fecha).toLocaleDateString('es-ES'),
      Cliente: cliente?.nombre || 'Sin cliente',
      'Método Pago': venta.metodo_pago,
      'Monto Total': `$${venta.monto_total.toLocaleString()}`,
      Descuento: (venta as any).descuento ? `$${(venta as any).descuento.toLocaleString()}` : '$0',
      Impuesto: (venta as any).impuesto ? `$${(venta as any).impuesto.toLocaleString()}` : '$0',
      Estado: venta.estado,
      'Fecha Cobro': (venta as any).fecha_cobro ? new Date((venta as any).fecha_cobro).toLocaleDateString('es-ES') : '',
      'Fecha Vencimiento': (venta as any).fecha_vencimiento ? new Date((venta as any).fecha_vencimiento).toLocaleDateString('es-ES') : ''
    };
  });
  
  const ventasSheet = XLSX.utils.json_to_sheet(ventasData);
  ventasSheet['!cols'] = [
    { width: 15 }, { width: 12 }, { width: 20 }, { width: 15 },
    { width: 15 }, { width: 12 }, { width: 12 }, { width: 12 },
    { width: 15 }, { width: 15 }
  ];
  applyHeaderStyles(ventasSheet);
  XLSX.utils.book_append_sheet(workbook, ventasSheet, '💳 Ventas');

  // Hoja de Gastos
  const gastosData = data.gastos.map(gasto => ({
    ID: gasto.id,
    Fecha: new Date(gasto.fecha).toLocaleDateString('es-ES'),
    Proveedor: gasto.proveedor,
    Monto: `$${gasto.monto.toLocaleString()}`,
    Tipo: gasto.tipo,
    'Categoría Fiscal': gasto.categoria_fiscal || 'No especificado',
    'Mes/Año': `${new Date(gasto.fecha).getMonth() + 1}/${new Date(gasto.fecha).getFullYear()}`,
    Notas: gasto.notas || ''
  }));
  
  const gastosSheet = XLSX.utils.json_to_sheet(gastosData);
  gastosSheet['!cols'] = [
    { width: 15 }, { width: 12 }, { width: 20 }, { width: 15 },
    { width: 15 }, { width: 18 }, { width: 12 }, { width: 30 }
  ];
  applyHeaderStyles(gastosSheet);
  XLSX.utils.book_append_sheet(workbook, gastosSheet, '💸 Gastos');

  // Hoja de Análisis Financiero
  const meses = Array.from(new Set([
    ...data.ventas.map(v => `${new Date(v.fecha).getFullYear()}-${(new Date(v.fecha).getMonth() + 1).toString().padStart(2, '0')}`),
    ...data.gastos.map(g => `${new Date(g.fecha).getFullYear()}-${(new Date(g.fecha).getMonth() + 1).toString().padStart(2, '0')}`)
  ])).sort();

  const analisisData = meses.map(mes => {
    const [year, month] = mes.split('-');
    const ventasMes = data.ventas.filter(v => {
      const vDate = new Date(v.fecha);
      return vDate.getFullYear() === parseInt(year) && vDate.getMonth() + 1 === parseInt(month);
    });
    const gastosMes = data.gastos.filter(g => {
      const gDate = new Date(g.fecha);
      return gDate.getFullYear() === parseInt(year) && gDate.getMonth() + 1 === parseInt(month);
    });

    const ingresos = ventasMes.reduce((sum, v) => sum + v.monto_total, 0);
    const egresos = gastosMes.reduce((sum, g) => sum + g.monto, 0);
    
    return {
      'Mes/Año': mes,
      'Ingresos': `$${ingresos.toLocaleString()}`,
      'Egresos': `$${egresos.toLocaleString()}`,
      'Flujo de Caja': `$${(ingresos - egresos).toLocaleString()}`,
      'Margen %': ingresos > 0 ? `${(((ingresos - egresos) / ingresos) * 100).toFixed(1)}%` : '0%',
      'N° Ventas': ventasMes.length,
      'N° Gastos': gastosMes.length,
      'Ticket Promedio': ventasMes.length > 0 ? `$${(ingresos / ventasMes.length).toLocaleString()}` : '$0'
    };
  });

  const analisisSheet = XLSX.utils.json_to_sheet(analisisData);
  analisisSheet['!cols'] = [
    { width: 12 }, { width: 15 }, { width: 15 }, { width: 15 },
    { width: 12 }, { width: 10 }, { width: 10 }, { width: 15 }
  ];
  applyHeaderStyles(analisisSheet);
  XLSX.utils.book_append_sheet(workbook, analisisSheet, '📈 Análisis Financiero');

  // Top Clientes
  const topClientes = data.clientes
    .map(cliente => ({
      cliente,
      total: data.ventas
        .filter(v => v.cliente_id === cliente.id)
        .reduce((sum, v) => sum + v.monto_total, 0),
      compras: data.ventas.filter(v => v.cliente_id === cliente.id).length
    }))
    .filter(item => item.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 20)
    .map((item, index) => ({
      'Ranking': index + 1,
      'Cliente': item.cliente.nombre,
      'Total Compras': `$${item.total.toLocaleString()}`,
      'N° Compras': item.compras,
      'Promedio por Compra': `$${(item.total / item.compras).toLocaleString()}`,
      'Estado': item.cliente.estado,
      'Email': item.cliente.email || '',
      'Teléfono': item.cliente.telefono || ''
    }));

  const topClientesSheet = XLSX.utils.json_to_sheet(topClientes);
  topClientesSheet['!cols'] = [
    { width: 10 }, { width: 25 }, { width: 15 }, { width: 10 },
    { width: 18 }, { width: 12 }, { width: 25 }, { width: 15 }
  ];
  applyHeaderStyles(topClientesSheet);
  XLSX.utils.book_append_sheet(workbook, topClientesSheet, '🏆 Top Clientes');

  // Top Productos
  const topProductos = data.productos
    .map(producto => {
      const ventasProducto = data.ventas.reduce((total, venta) => {
        const items = (venta as any).items || [];
        const item = items.find((i: any) => i.producto_id === producto.id);
        return total + (item ? item.cantidad * item.precio_unitario : 0);
      }, 0);
      
      const cantidadVendida = data.ventas.reduce((total, venta) => {
        const items = (venta as any).items || [];
        const item = items.find((i: any) => i.producto_id === producto.id);
        return total + (item ? item.cantidad : 0);
      }, 0);

      return {
        producto,
        totalVentas: ventasProducto,
        cantidadVendida
      };
    })
    .filter(item => item.totalVentas > 0)
    .sort((a, b) => b.totalVentas - a.totalVentas)
    .slice(0, 20)
    .map((item, index) => ({
      'Ranking': index + 1,
      'Producto': item.producto.nombre,
      'Categoría': item.producto.categoria,
      'Total Vendido': `$${item.totalVentas.toLocaleString()}`,
      'Cantidad Vendida': item.cantidadVendida,
      'Precio Actual': `$${item.producto.precio.toLocaleString()}`,
      'Stock Actual': item.producto.stock_actual,
      'Margen Unitario': `$${(item.producto.precio - item.producto.costo).toLocaleString()}`
    }));

  const topProductosSheet = XLSX.utils.json_to_sheet(topProductos);
  topProductosSheet['!cols'] = [
    { width: 10 }, { width: 25 }, { width: 15 }, { width: 15 },
    { width: 15 }, { width: 15 }, { width: 12 }, { width: 15 }
  ];
  applyHeaderStyles(topProductosSheet);
  XLSX.utils.book_append_sheet(workbook, topProductosSheet, '🥇 Top Productos');

  // Hoja de Proveedores
  const proveedoresData = data.proveedores.map(proveedor => {
    const comprasProveedor = data.compras.filter(c => c.proveedor_id === proveedor.id);
    const pagosProveedor = data.pagos.filter(p => p.proveedor_id === proveedor.id);
    const totalCompras = comprasProveedor.reduce((sum, c) => sum + c.monto_total, 0);
    const totalPagos = pagosProveedor.reduce((sum, p) => sum + p.monto, 0);
    
    return {
      ID: proveedor.id,
      Nombre: proveedor.nombre,
      Empresa: proveedor.empresa || '',
      Email: proveedor.email || '',
      Teléfono: proveedor.telefono || '',
      Especialidad: proveedor.especialidad || '',
      'Tipo Proveedor': proveedor.tipo_proveedor || '',
      Dirección: proveedor.direccion || '',
      Activo: proveedor.activo ? 'Sí' : 'No',
      'Total Compras': `$${totalCompras.toLocaleString()}`,
      'Total Pagos': `$${totalPagos.toLocaleString()}`,
      'Saldo Pendiente': `$${(totalCompras - totalPagos).toLocaleString()}`,
      'N° Compras': comprasProveedor.length,
      'Fecha Registro': new Date(proveedor.created_at).toLocaleDateString('es-ES'),
      Notas: proveedor.notas || ''
    };
  });
  
  const proveedoresSheet = XLSX.utils.json_to_sheet(proveedoresData);
  proveedoresSheet['!cols'] = [
    { width: 15 }, { width: 20 }, { width: 20 }, { width: 25 },
    { width: 15 }, { width: 20 }, { width: 15 }, { width: 25 },
    { width: 8 }, { width: 15 }, { width: 15 }, { width: 15 },
    { width: 10 }, { width: 15 }, { width: 30 }
  ];
  applyHeaderStyles(proveedoresSheet);
  XLSX.utils.book_append_sheet(workbook, proveedoresSheet, '🏢 Proveedores');

  // Hoja de Compras
  const comprasData = data.compras.map(compra => {
    const proveedor = data.proveedores.find(p => p.id === compra.proveedor_id);
    return {
      ID: compra.id,
      'Proveedor': proveedor?.nombre || 'Sin proveedor',
      Fecha: new Date(compra.fecha).toLocaleDateString('es-ES'),
      Concepto: compra.concepto,
      'Monto Total': `$${compra.monto_total.toLocaleString()}`,
      Estado: compra.estado,
      'N° Factura': compra.numero_factura || '',
      'Fecha Vencimiento': compra.fecha_vencimiento ? new Date(compra.fecha_vencimiento).toLocaleDateString('es-ES') : '',
      'Fecha Pago': compra.fecha_pago ? new Date(compra.fecha_pago).toLocaleDateString('es-ES') : '',
      'Método Pago': compra.metodo_pago || '',
      Notas: compra.notas || ''
    };
  });
  
  const comprasSheet = XLSX.utils.json_to_sheet(comprasData);
  comprasSheet['!cols'] = [
    { width: 15 }, { width: 20 }, { width: 12 }, { width: 25 },
    { width: 15 }, { width: 12 }, { width: 15 }, { width: 15 },
    { width: 15 }, { width: 15 }, { width: 30 }
  ];
  applyHeaderStyles(comprasSheet);
  XLSX.utils.book_append_sheet(workbook, comprasSheet, '🛒 Compras');

  // Hoja de Pagos
  const pagosData = data.pagos.map(pago => {
    const proveedor = data.proveedores.find(p => p.id === pago.proveedor_id);
    return {
      ID: pago.id,
      'Proveedor': proveedor?.nombre || 'Sin proveedor',
      Fecha: new Date(pago.fecha).toLocaleDateString('es-ES'),
      Monto: `$${pago.monto.toLocaleString()}`,
      'Método Pago': pago.metodo_pago,
      Concepto: pago.concepto || '',
      'N° Referencia': pago.numero_referencia || '',
      Notas: pago.notas || ''
    };
  });
  
  const pagosSheet = XLSX.utils.json_to_sheet(pagosData);
  pagosSheet['!cols'] = [
    { width: 15 }, { width: 20 }, { width: 12 }, { width: 15 },
    { width: 15 }, { width: 20 }, { width: 15 }, { width: 30 }
  ];
  applyHeaderStyles(pagosSheet);
  XLSX.utils.book_append_sheet(workbook, pagosSheet, '💳 Pagos Proveedores');

  // Guardar archivo con nombre mejorado
  const fileName = `Reporte_Completo_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};