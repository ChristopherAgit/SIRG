import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/reservas.css';

interface ReservationSummary {
  reservationID?: number;
  reservationDate?: string; // YYYY-MM-DD
  reservationTime?: string; // HH:mm:ss
  numberOfPeople?: number;
  restaurantTablesDto?: { tableNumber?: number };
  customersDto?: { fullName?: string; email?: string };
}

const ConfirmReservation: React.FC = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [reservation, setReservation] = useState<ReservationSummary | null>(null);

  useEffect(() => {
    const doConfirm = async () => {
      if (!token) {
        setError('Token inválido.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const resp = await fetch(`https://constantinopla.onrender.com/api/v1/reservations/confirm/${token}`, { method: 'GET' });
        const text = await resp.text();
        let body: any = null;
        try { body = JSON.parse(text); } catch { body = null; }

        if (!resp.ok) {
          setError((body && (body.message || body.Message)) || text || 'Error al confirmar la reserva.');
        } else {
          setMessage((body && (body.message || body.Message)) || 'Reserva confirmada exitosamente.');
          setReservation(body?.reservation || null);
        }
      } catch (e) {
        console.error(e);
        setError('Error de red. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    doConfirm();
  }, [token]);

  const goHome = () => navigate('/');

  return (
    <section id="reservas" className="reservation-section">
      <div className="reservation-container">
        {loading ? (
          <div className="loading-message"><p>Confirmando reserva...</p></div>
        ) : error ? (
          <div className="error-message"><p>{error}</p>
            <div style={{ marginTop: 18 }}>
              <button className="adminButton" onClick={goHome}>Ir al inicio</button>
            </div>
          </div>
        ) : (
          <div className="success-message">
            <h3>¡Reserva Confirmada!</h3>
            <p>{message}</p>

            {reservation && (
              <div className="reservation-details" style={{ marginTop: 16 }}>
                <div className="detail-item"><strong>Cliente:</strong> {reservation.customersDto?.fullName || '—'}</div>
                <div className="detail-item"><strong>Fecha:</strong> {reservation.reservationDate}</div>
                <div className="detail-item"><strong>Hora:</strong> {reservation.reservationTime?.substring(0,5)}</div>
                <div className="detail-item"><strong>Personas:</strong> {reservation.numberOfPeople}</div>
                <div className="detail-item"><strong>Mesa:</strong> #{reservation.restaurantTablesDto?.tableNumber || '—'}</div>
              </div>
            )}

            <div style={{ marginTop: 18 }}>
              <button className="adminButton" onClick={goHome}>Ir al inicio</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ConfirmReservation;
