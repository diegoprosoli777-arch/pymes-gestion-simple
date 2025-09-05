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
    cuit_dni: initialData?.cuit_dni || '',
    telefono: initialData?.telefono || '',
    email: initialData?.email || '',
    empresa: initialData?.empresa || '',
    especialidad: initialData?.especialidad || '',
    tipo_proveedor: initialData?.tipo_proveedor || 'productos',
    rubro: initialData?.rubro || '',
    calle: initialData?.calle || '',
    numero: initialData?.numero || '',
    ciudad: initialData?.ciudad || '',
    provincia: initialData?.provincia || '',
    codigo_postal: initialData?.codigo_postal || '',
    direccion: initialData?.direccion || '',
    notas: initialData?.notas || '',
    notas_internas: initialData?.notas_internas || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      return;
    }

    try {
      await onSubmit({
        nombre: formData.nombre.trim(),
        cuit_dni: formData.cuit_dni.trim() || undefined,
        telefono: formData.telefono.trim() || undefined,
        email: formData.email.trim() || undefined,
        empresa: formData.empresa.trim() || undefined,
        especialidad: formData.especialidad.trim() || undefined,
        tipo_proveedor: formData.tipo_proveedor,
        rubro: formData.rubro.trim() || undefined,
        calle: formData.calle.trim() || undefined,
        numero: formData.numero.trim() || undefined,
        ciudad: formData.ciudad.trim() || undefined,
        provincia: formData.provincia.trim() || undefined,
        codigo_postal: formData.codigo_postal.trim() || undefined,
        direccion: formData.direccion.trim() || undefined,
        notas: formData.notas.trim() || undefined,
        notas_internas: formData.notas_internas.trim() || undefined
      });
      
      setFormData({
        nombre: '',
        cuit_dni: '',
        telefono: '',
        email: '',
        empresa: '',
        especialidad: '',
        tipo_proveedor: 'productos',
        rubro: '',
        calle: '',
        numero: '',
        ciudad: '',
        provincia: '',
        codigo_postal: '',
        direccion: '',
        notas: '',
        notas_internas: ''
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
            <Label htmlFor="cuit_dni">CUIT / DNI</Label>
            <Input
              id="cuit_dni"
              type="text"
              value={formData.cuit_dni}
              onChange={(e) => setFormData(prev => ({ ...prev, cuit_dni: e.target.value }))}
              placeholder="20-12345678-9 o 12345678"
            />
          </div>

          <div>
            <Label htmlFor="empresa">Empresa / Razón Social</Label>
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
            <Label htmlFor="rubro">Rubro / Categoría</Label>
            <Select value={formData.rubro} onValueChange={(value) => setFormData(prev => ({ ...prev, rubro: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rubro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="insumos">Insumos</SelectItem>
                <SelectItem value="logistica">Logística</SelectItem>
                <SelectItem value="servicios">Servicios</SelectItem>
                <SelectItem value="tecnologia">Tecnología</SelectItem>
                <SelectItem value="construccion">Construcción</SelectItem>
                <SelectItem value="alimentacion">Alimentación</SelectItem>
                <SelectItem value="textil">Textil</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="consultoria">Consultoría</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="calle">Calle</Label>
              <Input
                id="calle"
                type="text"
                value={formData.calle}
                onChange={(e) => setFormData(prev => ({ ...prev, calle: e.target.value }))}
                placeholder="Nombre de la calle"
              />
            </div>
            <div>
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                type="text"
                value={formData.numero}
                onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                placeholder="1234"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="ciudad">Ciudad</Label>
              <Input
                id="ciudad"
                type="text"
                value={formData.ciudad}
                onChange={(e) => setFormData(prev => ({ ...prev, ciudad: e.target.value }))}
                placeholder="Ciudad"
              />
            </div>
            <div>
              <Label htmlFor="provincia">Provincia</Label>
              <Input
                id="provincia"
                type="text"
                value={formData.provincia}
                onChange={(e) => setFormData(prev => ({ ...prev, provincia: e.target.value }))}
                placeholder="Provincia"
              />
            </div>
            <div>
              <Label htmlFor="codigo_postal">Código Postal</Label>
              <Input
                id="codigo_postal"
                type="text"
                value={formData.codigo_postal}
                onChange={(e) => setFormData(prev => ({ ...prev, codigo_postal: e.target.value }))}
                placeholder="1234"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="direccion">Dirección Completa (Opcional)</Label>
            <Input
              id="direccion"
              type="text"
              value={formData.direccion}
              onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
              placeholder="Dirección completa alternativa"
            />
          </div>

          <div>
            <Label htmlFor="notas">Notas Públicas</Label>
            <Textarea
              id="notas"
              value={formData.notas}
              onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
              placeholder="Notas generales sobre el proveedor"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="notas_internas">Notas Internas</Label>
            <Textarea
              id="notas_internas"
              value={formData.notas_internas}
              onChange={(e) => setFormData(prev => ({ ...prev, notas_internas: e.target.value }))}
              placeholder="Notas internas privadas (condiciones especiales, contactos, etc.)"
              rows={2}
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