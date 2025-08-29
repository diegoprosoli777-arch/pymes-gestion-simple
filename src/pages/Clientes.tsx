import { useState } from "react";
import { Plus, Search, User, Mail, Phone, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'prospecto' | 'activo' | 'inactivo';
  total_revenue: number;
  last_purchase: string;
}

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const mockClients: Client[] = [
    {
      id: 1,
      name: "Juan Carlos Pérez",
      email: "juan.perez@techsolutions.com",
      phone: "+52 55 1234 5678",
      company: "Tech Solutions S.A.",
      status: "activo",
      total_revenue: 25400,
      last_purchase: "2024-01-15"
    },
    {
      id: 2,
      name: "María González",
      email: "maria@innovacion.com",
      phone: "+52 55 8765 4321",
      company: "Innovación Digital",
      status: "activo",
      total_revenue: 18750,
      last_purchase: "2024-01-12"
    },
    {
      id: 3,
      name: "Roberto Silva",
      email: "r.silva@sistemas.com",
      phone: "+52 55 2468 1357",
      company: "Sistemas Avanzados",
      status: "prospecto",
      total_revenue: 0,
      last_purchase: "N/A"
    },
    {
      id: 4,
      name: "Ana Martínez",
      email: "ana@devmovil.com",
      phone: "+52 55 9753 8642",
      company: "Desarrollo Móvil",
      status: "activo",
      total_revenue: 12800,
      last_purchase: "2024-01-08"
    },
    {
      id: 5,
      name: "Carlos Rodríguez",
      email: "carlos@webcorp.com",
      phone: "+52 55 1357 9246",
      company: "WebCorp Internacional",
      status: "inactivo",
      total_revenue: 11500,
      last_purchase: "2023-11-20"
    }
  ];

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo':
        return 'bg-success text-success-foreground';
      case 'prospecto':
        return 'bg-warning text-warning-foreground';
      case 'inactivo':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'activo':
        return 'Activo';
      case 'prospecto':
        return 'Prospecto';
      case 'inactivo':
        return 'Inactivo';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona tu cartera de clientes
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar clientes por nombre, email o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <div className="grid gap-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Información del Cliente */}
                <div className="lg:col-span-2">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-lg">{client.name}</h3>
                        <Badge className={getStatusColor(client.status)}>
                          {getStatusLabel(client.status)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>{client.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{client.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4" />
                          <span>{client.company}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Métricas */}
                <div className="text-center lg:text-left">
                  <p className="text-sm text-muted-foreground">Facturación Total</p>
                  <p className="text-2xl font-bold text-success">
                    ${client.total_revenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Última compra: {client.last_purchase}
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    Ver Historial
                  </Button>
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron clientes</h3>
            <p className="text-muted-foreground">
              Intenta cambiar los términos de búsqueda o agrega un nuevo cliente.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}