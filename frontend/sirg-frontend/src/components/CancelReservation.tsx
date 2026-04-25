import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/reservas.css';

const CancelReservation: React.FC = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const doCancel = async () => {
      if (!token) {
        setError('Token inválido.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const apiBase = "https://constantinopla.onrender.com" + '/api/v1';
        const resp = await fetch(`${apiBase}/reservations/cancel/${token}`, { method: 'GET' });
        const text = await resp.text();
        let body: any = null;
        try { body = JSON.parse(text); } catch { body = null; }

        if (!resp.ok) {
          setError((body && (body.message || body.Message)) || text || 'Error al cancelar la reserva.');
        } else {
          setMessage((body && (body.message || body.Message)) || 'Reserva cancelada exitosamente.');
        }
      } catch (e) {
        console.error(e);
        setError('Error de red. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    doCancel();
  }, [token]);

  const goHome = () => navigate('/');

  return (
    <section id="reservas" className="reservation-section">
      <div className="reservation-container">
        {loading ? (
          <div className="loading-message"><p>Cancelando reserva...</p></div>
        ) : error ? (
          <div className="error-message"><p>{error}</p>
            <div style={{ marginTop: 18 }}>
              <button className="adminButton" onClick={goHome}>Ir al inicio</button>
            </div>
          </div>
        ) : (
          <div className="success-message">
            <h3>Reserva Cancelada</h3>
            <p>{message}</p>

            <div style={{ marginTop: 18 }}>
              <button className="adminButton" onClick={goHome}>Ir al inicio</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CancelReservation;
