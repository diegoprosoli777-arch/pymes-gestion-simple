import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const importFromExcel = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsBinaryString(file);
  });
};

export const exportVentasReport = (ventas: any[], ventasItems: any[], productos: any[], clientes: any[]) => {
  const reportData = ventas.map(venta => {
    const cliente = clientes.find(c => c.id === venta.cliente_id);
    const items = ventasItems.filter(item => item.venta_id === venta.id);
    const itemsDetail = items.map(item => {
      const producto = productos.find(p => p.id === item.producto_id);
      return `${producto?.nombre} (${item.cantidad}x${item.precio_unitario})`;
    }).join(', ');
    
    return {
      Fecha: venta.fecha,
      Cliente: cliente?.nombre || 'N/A',
      'Monto Total': venta.monto_total,
      'Método de Pago': venta.metodo_pago,
      Estado: venta.estado,
      'Productos Vendidos': itemsDetail
    };
  });
  
  exportToExcel(reportData, 'reporte-ventas', 'Ventas');
};

export const exportProductosReport = (productos: any[]) => {
  const reportData = productos.map(producto => ({
    Nombre: producto.nombre,
    Costo: producto.costo,
    Precio: producto.precio,
    'Stock Actual': producto.stock_actual,
    'Stock Mínimo': producto.stock_minimo,
    Categoría: producto.categoria,
    'Margen %': (((producto.precio - producto.costo) / producto.precio) * 100).toFixed(1)
  }));
  
  exportToExcel(reportData, 'reporte-productos', 'Productos');
};

export const exportClientesReport = (clientes: any[]) => {
  const reportData = clientes.map(cliente => ({
    Nombre: cliente.nombre,
    Email: cliente.email,
    Teléfono: cliente.telefono,
    Empresa: cliente.empresa,
    Estado: cliente.estado,
    Notas: cliente.notas
  }));
  
  exportToExcel(reportData, 'reporte-clientes', 'Clientes');
};