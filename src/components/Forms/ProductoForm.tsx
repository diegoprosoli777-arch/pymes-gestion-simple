import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Producto } from "@/hooks/useProductos";

interface ProductoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Producto, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  initialData?: Producto;
  title: string;
}

export const ProductoForm = ({ isOpen, onClose, onSubmit, initialData, title }: ProductoFormProps) => {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    costo: initialData?.costo || 0,
    precio: initialData?.precio || 0,
    stock_actual: initialData?.stock_actual || 0,
    stock_minimo: initialData?.stock_minimo || 0,
    categoria: initialData?.categoria || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
      onClose();
      setFormData({
        nombre: '',
        costo: 0,
        precio: 0,
        stock_actual: 0,
        stock_minimo: 0,
        categoria: ''
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
          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="costo">Costo</Label>
              <Input
                id="costo"
                type="number"
                step="0.01"
                value={formData.costo}
                onChange={(e) => setFormData(prev => ({ ...prev, costo: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="precio">Precio</Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={(e) => setFormData(prev => ({ ...prev, precio: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="stock_actual">Stock Actual</Label>
              <Input
                id="stock_actual"
                type="number"
                value={formData.stock_actual}
                onChange={(e) => setFormData(prev => ({ ...prev, stock_actual: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stock_minimo">Stock Mínimo</Label>
              <Input
                id="stock_minimo"
                type="number"
                value={formData.stock_minimo}
                onChange={(e) => setFormData(prev => ({ ...prev, stock_minimo: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="categoria">Categoría</Label>
            <Input
              id="categoria"
              value={formData.categoria}
              onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
              required
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