import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CompraProveedor } from '@/hooks/useProveedores';

interface CompraProveedorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CompraProveedor, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  proveedorId: string;
}

export function CompraProveedorForm({ isOpen, onClose, onSubmit, proveedorId }: CompraProveedorFormProps) {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    numero_factura: '',
    concepto: '',
    monto_total: '',
    estado: 'pendiente' as 'pendiente' | 'pagada' | 'vencida',
    fecha_vencimiento: '',
    metodo_pago: '',
    notas: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.concepto.trim() || !formData.monto_total) {
      return;
    }

    try {
      await onSubmit({
        proveedor_id: proveedorId,
        fecha: formData.fecha,
        numero_factura: formData.numero_factura.trim() || undefined,
        concepto: formData.concepto.trim(),
        monto_total: parseFloat(formData.monto_total),
        estado: formData.estado,
        fecha_vencimiento: formData.fecha_vencimiento || undefined,
        fecha_pago: formData.estado === 'pagada' ? formData.fecha : undefined,
        metodo_pago: formData.metodo_pago || undefined,
        notas: formData.notas.trim() || undefined
      });
      
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        numero_factura: '',
        concepto: '',
        monto_total: '',
        estado: 'pendiente',
        fecha_vencimiento: '',
        metodo_pago: '',
        notas: ''
      });
      onClose();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Compra</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fecha">Fecha *</Label>
            <Input
              id="fecha"
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="concepto">Concepto *</Label>
            <Input
              id="concepto"
              type="text"
              value={formData.concepto}
              onChange={(e) => setFormData(prev => ({ ...prev, concepto: e.target.value }))}
              placeholder="Descripción de la compra"
              required
            />
          </div>

          <div>
            <Label htmlFor="monto_total">Monto Total *</Label>
            <Input
              id="monto_total"
              type="number"
              step="0.01"
              value={formData.monto_total}
              onChange={(e) => setFormData(prev => ({ ...prev, monto_total: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="numero_factura">Número de Factura</Label>
            <Input
              id="numero_factura"
              type="text"
              value={formData.numero_factura}
              onChange={(e) => setFormData(prev => ({ ...prev, numero_factura: e.target.value }))}
              placeholder="Número de factura"
            />
          </div>

          <div>
            <Label htmlFor="estado">Estado</Label>
            <Select value={formData.estado} onValueChange={(value: 'pendiente' | 'pagada' | 'vencida') => setFormData(prev => ({ ...prev, estado: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="pagada">Pagada</SelectItem>
                <SelectItem value="vencida">Vencida</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento</Label>
            <Input
              id="fecha_vencimiento"
              type="date"
              value={formData.fecha_vencimiento}
              onChange={(e) => setFormData(prev => ({ ...prev, fecha_vencimiento: e.target.value }))}
            />
          </div>

          {formData.estado === 'pagada' && (
            <div>
              <Label htmlFor="metodo_pago">Método de Pago</Label>
              <Select value={formData.metodo_pago} onValueChange={(value) => setFormData(prev => ({ ...prev, metodo_pago: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              value={formData.notas}
              onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
              placeholder="Notas adicionales"
              rows={2}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!formData.concepto.trim() || !formData.monto_total}>
              Registrar Compra
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}