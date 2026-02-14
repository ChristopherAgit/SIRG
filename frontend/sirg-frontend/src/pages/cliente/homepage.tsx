import { useNavigate } from "react-router-dom";
import "./HomePage.css";

export const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <div className="overlay" />

            <div className="content">
                <div className="logo-box">
                    <span className="logo-text">SIRG</span>
                </div>

                <h2 className="subtitle">Elige la opción</h2>

                <button
                    className="primary-btn"
                    onClick={() => navigate("/reservar")}
                >
                    Hacer Reservación
                </button>

                <button
                    className="secondary-btn"
                    onClick={() => navigate("/ver-reserva")}
                >
                    Ver Reservas
                </button>

                <p className="footer-text">
                    BIENVENIDOS A LA EXPERIENCIA SIRG
                </p>
            </div>
        </div>
    );
};
