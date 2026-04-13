import {MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react"
import "../styles/contacto.css"
const Contacto = () => {
    const contactos =[
        {
            icon: <MapPin size={28} className="icon-crimson"/>,
            title: "Direccion",
            lines: ["Av. Romulo Betancourt, Local 00", "Santo Domingo"]
        },
        {
            icon: <Phone size={28} className="icon-crimson"/>,
            title: "Telefono",
            lines: ["809-000-0000", "849-000-0000"]
        },
        {
            icon: <Mail size={28} className="icon-crimson"/>,
            title: "Email",
            lines: ["consta@tinopla.com"]
        }
    ]
    return (
        <section id="contacto" className="contact-section">
            <div className="container">
                <div className="header">
                    <p className="subtitle">Encuentranos</p>
                    <h2 className="title">Contactos</h2>
                    <br />
                    <br />
                </div>
            </div>
            <div className="grid">
                {contactos.map((c) => (
                    <div key={c.title} className="card">
                        <div className="icon">{c.icon}</div>
                        <h3>{c.title}</h3>
                        {c.lines.map((l) => (
                            <p key={l}>{l}</p>
                        ))}
                    </div>
                ))}
            </div>
            <div className="social">
                <p className="social-title">Siguenos</p>
                <div className="social-icons">
                    <a href="#"><Instagram size={20}/></a>
                    <a href="#"><Facebook size={20}/></a>

                </div>
            </div>

        </section>
    )
}
export default Contacto;