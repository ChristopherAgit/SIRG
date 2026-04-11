import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import "../styles/nav.css";

const Nav = () => {

  // estado para abrir/cerrar menú móvil
  const [isOpen, setIsOpen] = useState(false);

  // estado para detectar scroll
  const [scrolled, setScrolled] = useState(false);

  // Detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // limpiar evento
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>

      <div className="navbar-container">

        {/* LOGO */}
        <a href="#" className="logo" >
          <span>Constan</span>Tinopla
        </a>

        {/* LINKS DESKTOP */}
        <ul className="nav-links">
          <li><a href="#menu">Menú</a></li>
          <li><a href="#nosotros">Nosotros</a></li>
          <li><a href="#horario">Horarios</a></li>
          <li><a href="#contacto">Contacto</a></li>
          <li><a href="#reservas">Reservar</a></li>
        </ul>

        {/* BOTÓN MÓVIL */}
        <button
          className="menu-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

      </div>

      {/* MENÚ MÓVIL */}
      {isOpen && (
        <div className="mobile-menu">
          <ul>
            <li><a href="#menu" onClick={() => setIsOpen(false)}>Menú</a></li>
            <li><a href="#about" onClick={() => setIsOpen(false)}>Nosotros</a></li>
            <li><a href="#horarios" onClick={() => setIsOpen(false)}>Horarios</a></li>
            <li><a href="#contacto" onClick={() => setIsOpen(false)}>Contacto</a></li>
            <li><a href="reservas" onClick={() => setIsOpen(false)}>Reservar</a></li>
          </ul>
        </div>
      )}

    </nav>
  );
};

export default Nav;