import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, Users, ShoppingCart, Receipt, FileText, Building2, TrendingUp, Calculator, UserCheck, BarChart3 } from "lucide-react";
const navigation = [{
  name: 'Dashboard',
  href: '/',
  icon: LayoutDashboard
}, {
  name: 'Productos',
  href: '/productos',
  icon: Package
}, {
  name: 'Clientes',
  href: '/clientes',
  icon: Users
}, {
  name: 'CRM',
  href: '/crm',
  icon: UserCheck
}, {
  name: 'Ventas',
  href: '/ventas',
  icon: ShoppingCart
}, {
  name: 'Gastos',
  href: '/gastos',
  icon: Receipt
}, {
  name: 'Financiamiento',
  href: '/financiamiento',
  icon: TrendingUp
}, {
  name: 'Tributaria',
  href: '/tributaria',
  icon: Calculator
}, {
  name: 'Planificación',
  href: '/planificacion',
  icon: BarChart3
}, {
  name: 'Reportes',
  href: '/reportes',
  icon: FileText
}];
export default function Sidebar() {
  return <div className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="bg-primary p-2 rounded-lg">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">DMP soluciones
          </h1>
            <p className="text-sm text-muted-foreground">Gestión Empresarial</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map(item => <NavLink key={item.name} to={item.href} className={({
        isActive
      }) => `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}>
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </NavLink>)}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="bg-muted p-3 rounded-lg">
          <p className="text-xs text-muted-foreground font-medium">Sistema v1.0</p>
          <p className="text-xs text-muted-foreground">© 2024</p>
        </div>
      </div>
    </div>;
}