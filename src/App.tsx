import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import toast, { Toaster as HotToaster } from 'react-hot-toast';
import MainLayout from "./components/Layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Productos from "./pages/Productos";
import Clientes from "./pages/Clientes";
import CRM from "./pages/CRM";
import Ventas from "./pages/Ventas";
import Gastos from "./pages/Gastos";
import Financiamiento from "./pages/Financiamiento";
import Tributaria from "./pages/Tributaria";
import Planificacion from "./pages/Planificacion";
import Reportes from "./pages/Reportes";
import Proveedores from "./pages/Proveedores";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HotToaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="productos" element={<Productos />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="crm" element={<CRM />} />
            <Route path="ventas" element={<Ventas />} />
            <Route path="gastos" element={<Gastos />} />
            <Route path="proveedores" element={<Proveedores />} />
            <Route path="financiamiento" element={<Financiamiento />} />
            <Route path="tributaria" element={<Tributaria />} />
            <Route path="planificacion" element={<Planificacion />} />
            <Route path="reportes" element={<Reportes />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
