
import Reservas from './components/reservas';
import Home from './Home';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {

  return (
      <BrowserRouter>
        <Routes>
          <Route   path='' element={<Home/>} />
          <Route path='/reservas' element={<Reservas/>} />
        </Routes>
      </BrowserRouter>  
  );
}

export default App
