import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { useClientes } from "@/hooks/useClientes";
import { useProductos } from "@/hooks/useProductos";
import { Venta, VentaItem } from "@/hooks/useVentas";

interface VentaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (venta: Omit<Venta, 'id' | 'created_at' | 'updated_at'>, items: Omit<VentaItem, 'id' | 'venta_id' | 'created_at'>[]) => Promise<void>;
  title: string;
}

interface VentaItemForm {
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
}

export const VentaForm = ({ isOpen, onClose, onSubmit, title }: VentaFormProps) => {
  const { clientes } = useClientes();
  const { productos } = useProductos();
  
  const [formData, setFormData] = useState<{
    fecha: string;
    cliente_id: string;
    metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia';
    estado: 'cobrada' | 'pendiente';
  }>({
    fecha: new Date().toISOString().split('T')[0],
    cliente_id: '',
    metodo_pago: 'efectivo',
    estado: 'pendiente'
  });
  
  const [items, setItems] = useState<VentaItemForm[]>([{
    producto_id: '',
    cantidad: 1,
    precio_unitario: 0
  }]);
  
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    setItems(prev => [...prev, {
      producto_id: '',
      cantidad: 1,
      precio_unitario: 0
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof VentaItemForm, value: string | number) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const updateItemPrice = (index: number, producto_id: string) => {
    const producto = productos.find(p => p.id === producto_id);
    if (producto) {
      updateItem(index, 'precio_unitario', producto.precio);
    }
  };

  const getTotalVenta = () => {
    return items.reduce((total, item) => total + (item.cantidad * item.precio_unitario), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const venta = {
        ...formData,
        monto_total: getTotalVenta()
      };
      
      await onSubmit(venta, items);
      onClose();
      
      // Reset form
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        cliente_id: '',
        metodo_pago: 'efectivo',
        estado: 'pendiente'
      });
      setItems([{
        producto_id: '',
        cantidad: 1,
        precio_unitario: 0
      }]);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="cliente">Cliente</Label>
              <Select value={formData.cliente_id} onValueChange={(value) => setFormData(prev => ({ ...prev, cliente_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map(cliente => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="metodo_pago">Método de Pago</Label>
              <Select value={formData.metodo_pago} onValueChange={(value: 'efectivo' | 'tarjeta' | 'transferencia') => setFormData(prev => ({ ...prev, metodo_pago: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={formData.estado} onValueChange={(value: 'cobrada' | 'pendiente') => setFormData(prev => ({ ...prev, estado: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="cobrada">Cobrada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Productos</Label>
              <Button type="button" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Producto
              </Button>
            </div>

            {items.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-4 gap-4 items-end">
                    <div className="grid gap-2">
                      <Label>Producto</Label>
                      <Select 
                        value={item.producto_id} 
                        onValueChange={(value) => {
                          updateItem(index, 'producto_id', value);
                          updateItemPrice(index, value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {productos.map(producto => (
                            <SelectItem key={producto.id} value={producto.id}>
                              {producto.nombre} (Stock: {producto.stock_actual})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => updateItem(index, 'cantidad', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label>Precio Unit.</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.precio_unitario}
                        onChange={(e) => updateItem(index, 'precio_unitario', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        ${(item.cantidad * item.precio_unitario).toFixed(2)}
                      </span>
                      {items.length > 1 && (
                        <Button type="button" size="sm" variant="outline" onClick={() => removeItem(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="text-lg font-semibold">
              Total: ${getTotalVenta().toFixed(2)}
            </div>
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Venta'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};