import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { reservationService } from "../../services/reservation.service";
import type { ReservationResponse } from "../../types/reservation.types";
import "./ViewReservationPage.css";

export const ViewReservationPage = () => {
    const [search, setSearch] = useState("");
    const [reservation, setReservation] = useState<ReservationResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    const handleSearch = async () => {
        if (!search.trim()) return;

        try {
            setLoading(true);
            const result = await reservationService.getByCode(search);
            setReservation(result);
        } catch (error) {
            alert("Reserva no encontrada");
            console.log(error)
            setReservation(null);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (!reservation) return;

        setReservation({
            ...reservation,
            status: "cancelled",
        });
    };

    return (
        <div className="view-container">
            <h2>Reservations</h2>
            
            <button className="back-btn" onClick={() => navigate("/")}>
                ← Volver al Inicio
            </button>
            <p className="subtitle">Gestiona tus reservas</p>

            <div className="search-box">
                <input
                    type="text"
                    placeholder="Search by code..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button onClick={handleSearch}>
                    {loading ? "Buscando..." : "Buscar"}
                </button>
            </div>

            {reservation && (
                <div className="reservation-card">
                    <div className="card-header">
                        <span className="code">#{reservation.reservationCode}</span>
                        <span className={`status ${reservation.status}`}>
                            {reservation.status.toUpperCase()}
                        </span>
                    </div>

                    <h3>{reservation.fullName}</h3>

                    <div className="details">
                        <p>📅 {reservation.date}</p>
                        <p>⏰ {reservation.time}</p>
                        <p>👥 {reservation.guests} Guests</p>
                        <p>📧 {reservation.email}</p>
                        <p>📞 {reservation.phone}</p>
                    </div>

                    {reservation.status !== "cancelled" && (
                        <button className="cancel-btn" onClick={handleCancel}>
                            Cancelar Reserva
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
