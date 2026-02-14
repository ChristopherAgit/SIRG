import { Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/cliente/homepage";
import { CreateReservationPage } from "./pages/cliente/CreateReservationPage";
import { ReservationSuccessPage } from "./pages/cliente/ReservationSuccessPage";
import { ViewReservationPage } from "./pages/cliente/ViewReservationPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/reservar" element={<CreateReservationPage />} />
      <Route path="/reserva-exitosa" element={<ReservationSuccessPage />} />
      <Route path="/ver-reserva" element={<ViewReservationPage />} />
    </Routes>
  );
}

export default App;

