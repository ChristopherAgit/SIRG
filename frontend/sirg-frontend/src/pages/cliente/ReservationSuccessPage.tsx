import { useLocation, useNavigate } from "react-router-dom";
import type { ReservationResponse } from "../../types/reservation.types";
import "./ReservationSuccessPage.css";

export const ReservationSuccessPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const reservation = location.state as ReservationResponse | undefined;

    if (!reservation) {
        return (
            <div style={{ padding: "40px", color: "white" }}>
                No se encontró información de la reserva.
            </div>
        );
    }

    return (
        <div className="success-container">
            <h2>🎉 Reserva Confirmada</h2>

            <div className="success-card">
                <p><strong>Código:</strong> {reservation.reservationCode}</p>
                <p><strong>Nombre:</strong> {reservation.fullName}</p>
                <p><strong>Fecha:</strong> {reservation.date}</p>
                <p><strong>Hora:</strong> {reservation.time}</p>
                <p><strong>Personas:</strong> {reservation.guests}</p>
            </div>

            <button onClick={() => navigate("/")}>
                Volver al Inicio
            </button>
        </div>
    );
};
