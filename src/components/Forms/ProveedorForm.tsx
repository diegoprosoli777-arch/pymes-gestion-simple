import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Proveedor } from '@/hooks/useProveedores';

interface ProveedorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Proveedor, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  title: string;
  initialData?: Proveedor;
}

export function ProveedorForm({ isOpen, onClose, onSubmit, title, initialData }: ProveedorFormProps) {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    telefono: initialData?.telefono || '',
    email: initialData?.email || '',
    empresa: initialData?.empresa || '',
    especialidad: initialData?.especialidad || '',
    tipo_proveedor: initialData?.tipo_proveedor || 'productos',
    direccion: initialData?.direccion || '',
    notas: initialData?.notas || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      return;
    }

    try {
      await onSubmit({
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim() || undefined,
        email: formData.email.trim() || undefined,
        empresa: formData.empresa.trim() || undefined,
        especialidad: formData.especialidad.trim() || undefined,
        tipo_proveedor: formData.tipo_proveedor,
        direccion: formData.direccion.trim() || undefined,
        notas: formData.notas.trim() || undefined
      });
      
      setFormData({
        nombre: '',
        telefono: '',
        email: '',
        empresa: '',
        especialidad: '',
        tipo_proveedor: 'productos',
        direccion: '',
        notas: ''
      });
      onClose();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              placeholder="Nombre del proveedor"
              required
            />
          </div>

          <div>
            <Label htmlFor="empresa">Empresa</Label>
            <Input
              id="empresa"
              type="text"
              value={formData.empresa}
              onChange={(e) => setFormData(prev => ({ ...prev, empresa: e.target.value }))}
              placeholder="Nombre de la empresa"
            />
          </div>

          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
              placeholder="Teléfono"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Email"
            />
          </div>

          <div>
            <Label htmlFor="especialidad">Especialidad / Qué Provee</Label>
            <Input
              id="especialidad"
              type="text"
              value={formData.especialidad}
              onChange={(e) => setFormData(prev => ({ ...prev, especialidad: e.target.value }))}
              placeholder="Ej: Materiales de construcción, Equipos de oficina"
            />
          </div>

          <div>
            <Label htmlFor="tipo_proveedor">Tipo de Proveedor</Label>
            <Select value={formData.tipo_proveedor} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_proveedor: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="productos">Productos</SelectItem>
                <SelectItem value="servicios">Servicios</SelectItem>
                <SelectItem value="materiales">Materiales</SelectItem>
                <SelectItem value="equipos">Equipos</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              type="text"
              value={formData.direccion}
              onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
              placeholder="Dirección completa"
            />
          </div>

          <div>
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              value={formData.notas}
              onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
              placeholder="Notas adicionales sobre el proveedor"
              rows={3}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!formData.nombre.trim()}>
              {initialData ? 'Actualizar' : 'Crear'} Proveedor
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}