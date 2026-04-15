import Home from './Home';
import Reservas from './components/reservas';
import Menucomplete from './components/menucomplete';
import Login from './Login';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './admin/layouts/AdminLayout';
import { AdminDashboardPage } from './admin/pages/AdminDashboardPage';
import { RolesPage } from './admin/pages/RolesPage';
import { IngredientsPage } from './admin/pages/IngredientsPage';
import { MenuPage } from './admin/pages/MenuPage';
import { TablesPage } from './admin/pages/TablesPage';
import { InventoryPage } from './admin/pages/InventoryPage';
import { MeseroPage } from './mesero/pages/MeseroPage';
import { CocineroPage } from './cocinero/pages/CocineroPage';
import PrivateRoute from './PrivateRoute';


function App() {

  return (
      <BrowserRouter>
        <Routes>
          <Route   path='' element={<Home/>} />
          <Route path='/reservas' element={<Reservas/>} />
          <Route path="/menucomplete" element={<Menucomplete/>} />

          {/* Admin */}
          <Route path="/admin" element={<PrivateRoute roles={["Administrador"]}><AdminLayout /></PrivateRoute>}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="ingredientes" element={<IngredientsPage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="mesas" element={<TablesPage />} />
            <Route path="inventario" element={<InventoryPage />} />
          </Route>

          <Route path="/mesero" element={<PrivateRoute roles={["Mesero","Administrador"]}><MeseroPage /></PrivateRoute>} />
          <Route path="/cocinero" element={<CocineroPage />} />
          <Route path="/login" element={<Login />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>  
  );
}

export default App
