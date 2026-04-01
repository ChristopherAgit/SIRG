
import Reservas from './components/reservas';
import Home from './Home';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './admin/layouts/AdminLayout';
import { AdminDashboardPage } from './admin/pages/AdminDashboardPage';
import { RolesPage } from './admin/pages/RolesPage';
import { IngredientsPage } from './admin/pages/IngredientsPage';
import { DishesPage } from './admin/pages/DishesPage';
import { RecipesPage } from './admin/pages/RecipesPage';
import { InventoryPage } from './admin/pages/InventoryPage';
import { AnalyticsPage } from './admin/pages/AnalyticsPage';

function App() {

  return (
      <BrowserRouter>
        <Routes>
          <Route   path='' element={<Home/>} />
          <Route path='/reservas' element={<Reservas/>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="ingredientes" element={<IngredientsPage />} />
            <Route path="platos" element={<DishesPage />} />
            <Route path="recetas" element={<RecipesPage />} />
            <Route path="inventario" element={<InventoryPage />} />
            <Route path="analitica" element={<AnalyticsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>  
  );
}

export default App
