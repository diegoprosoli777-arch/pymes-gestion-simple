import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PagoProveedor } from '@/hooks/useProveedores';

interface PagoProveedorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<PagoProveedor, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  proveedorId: string;
}

export function PagoProveedorForm({ isOpen, onClose, onSubmit, proveedorId }: PagoProveedorFormProps) {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    monto: '',
    metodo_pago: 'efectivo',
    numero_referencia: '',
    concepto: '',
    notas: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.monto) {
      return;
    }

    try {
      await onSubmit({
        proveedor_id: proveedorId,
        fecha: formData.fecha,
        monto: parseFloat(formData.monto),
        metodo_pago: formData.metodo_pago,
        numero_referencia: formData.numero_referencia.trim() || undefined,
        concepto: formData.concepto.trim() || undefined,
        notas: formData.notas.trim() || undefined
      });
      
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        monto: '',
        metodo_pago: 'efectivo',
        numero_referencia: '',
        concepto: '',
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
          <DialogTitle>Registrar Pago</DialogTitle>
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
            <Label htmlFor="monto">Monto *</Label>
            <Input
              id="monto"
              type="number"
              step="0.01"
              value={formData.monto}
              onChange={(e) => setFormData(prev => ({ ...prev, monto: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="metodo_pago">Método de Pago *</Label>
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

          <div>
            <Label htmlFor="concepto">Concepto</Label>
            <Input
              id="concepto"
              type="text"
              value={formData.concepto}
              onChange={(e) => setFormData(prev => ({ ...prev, concepto: e.target.value }))}
              placeholder="Descripción del pago"
            />
          </div>

          <div>
            <Label htmlFor="numero_referencia">Número de Referencia</Label>
            <Input
              id="numero_referencia"
              type="text"
              value={formData.numero_referencia}
              onChange={(e) => setFormData(prev => ({ ...prev, numero_referencia: e.target.value }))}
              placeholder="Número de referencia o comprobante"
            />
          </div>

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
            <Button type="submit" disabled={!formData.monto}>
              Registrar Pago
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}