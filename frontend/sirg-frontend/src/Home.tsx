import Nav from './components/nav';
import Hero from './components/hero';
import Nosotros from './components/nosotros'
import Menu from './components/menu'
import Horario from './components/horario'
import Contacto from './components/contacto'
// import { BrowserRouter, Router, Route } from 'react-router-dom';

function Home() {

  return (
      <>
      <Nav/>
      <Hero/>
      <Menu/>
      <Nosotros/>
      <Horario/>
      <Contacto/>
      
      </>
  );
}

export default Home
