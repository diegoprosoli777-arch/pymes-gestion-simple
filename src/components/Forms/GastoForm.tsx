import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Gasto } from "@/hooks/useGastos";

interface GastoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Gasto, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  initialData?: Gasto;
  title: string;
}

export const GastoForm = ({ isOpen, onClose, onSubmit, initialData, title }: GastoFormProps) => {
  const [formData, setFormData] = useState({
    fecha: initialData?.fecha || new Date().toISOString().split('T')[0],
    proveedor: initialData?.proveedor || '',
    monto: initialData?.monto || 0,
    tipo: initialData?.tipo || 'operativo' as const,
    categoria_fiscal: initialData?.categoria_fiscal || 'operativo',
    notas: initialData?.notas || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
      onClose();
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        proveedor: '',
        monto: 0,
        tipo: 'operativo',
        categoria_fiscal: 'operativo',
        notas: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
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
              <Label htmlFor="monto">Monto</Label>
              <Input
                id="monto"
                type="number"
                step="0.01"
                value={formData.monto}
                onChange={(e) => setFormData(prev => ({ ...prev, monto: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="proveedor">Proveedor</Label>
            <Input
              id="proveedor"
              value={formData.proveedor}
              onChange={(e) => setFormData(prev => ({ ...prev, proveedor: e.target.value }))}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Select value={formData.tipo} onValueChange={(value: 'operativo' | 'insumo' | 'otro') => setFormData(prev => ({ ...prev, tipo: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operativo">Operativo</SelectItem>
                <SelectItem value="insumo">Insumo</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="categoria_fiscal">Categoría Fiscal</Label>
            <Select value={formData.categoria_fiscal} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria_fiscal: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operativo">Operativo</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="administrativo">Administrativo</SelectItem>
                <SelectItem value="financiero">Financiero</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              value={formData.notas}
              onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};