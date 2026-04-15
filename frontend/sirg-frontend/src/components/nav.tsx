import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import "../styles/nav.css";

const Nav = () => {

  const [isOpen, setIsOpen] = useState(false);
  const [authRoles, setAuthRoles] = useState<string[]>([]);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sirg_auth');
      if (raw) {
        const parsed = JSON.parse(raw);
        setAuthRoles(parsed.roles ?? []);
      }
    } catch {
      setAuthRoles([]);
    }
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>

      <div className="navbar-container">

        <a href="/" className="logo" >
          <span>Constan</span>Tinopla
        </a>

        <ul className="nav-links">
          <li><a href="/">Inicio</a></li>
          <li><a href="#menu">Menú</a></li>
          <li><a href="#nosotros">Nosotros</a></li>
          <li><a href="#horario">Horarios</a></li>
          <li><a href="#contacto">Contacto</a></li>
          <li><a href="/reservas">Reservar</a></li>
          {authRoles.includes('Administrador') && <li><a href="/admin">Panel</a></li>}
          {authRoles.includes('Mesero') && <li><a href="/mesero">Mesero</a></li>}
          <li><a href="/login">Iniciar sesión</a></li>
          {authRoles.length > 0 && <li><button className="nav-logout" onClick={() => { localStorage.removeItem('sirg_auth'); window.location.href = '/'; }}>Cerrar sesión</button></li>}
        </ul>

        <button
          className="menu-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

      </div>

      {isOpen && (
        <div className="mobile-menu">
          <ul>
            <li><a href="/" onClick={() => setIsOpen(false)}>Inicio</a></li>
            <li><a href="#menu" onClick={() => setIsOpen(false)}>Menú</a></li>
            <li><a href="#about" onClick={() => setIsOpen(false)}>Nosotros</a></li>
            <li><a href="#horarios" onClick={() => setIsOpen(false)}>Horarios</a></li>
            <li><a href="#contacto" onClick={() => setIsOpen(false)}>Contacto</a></li>
            <li><a href="reservas" onClick={() => setIsOpen(false)}>Reservar</a></li>
            <li><a href="/login" onClick={() => setIsOpen(false)}>Iniciar sesión</a></li>
          </ul>
        </div>
      )}

    </nav>
  );
};

export default Nav;