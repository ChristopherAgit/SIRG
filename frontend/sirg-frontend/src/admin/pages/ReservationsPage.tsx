import { useEffect, useState } from 'react';
import { Calendar, Clock, Users, MapPin, Mail, Phone, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import '../styles/reservations.css';

interface ReservationDetail {
  reservationID: number;
  tableID: number;
  statusID: number;
  reservationDate: string; // YYYY-MM-DD
  reservationTime: string; // HH:mm:ss
  numberOfPeople: number;
  createdAt: string;
  restaurantTablesDto?: {
    tableID: number;
    tableNumber: number;
    capacity: number;
    isActive: boolean;
  };
  customersDto?: {
    customerID?: number;
    fullName: string;
    phone?: string;
    email?: string;
  };
}

interface ReservationStatus {
  statusID: number;
  statusName: string;
}

const STATUS_MAP: { [key: number]: { label: string; color: string; icon: React.ReactNode } } = {
  1: { label: 'Pendiente', color: '#ff9800', icon: <AlertCircle size={16} /> },
  2: { label: 'Confirmada', color: '#4caf50', icon: <CheckCircle size={16} /> },
  3: { label: 'Cancelada', color: '#f44336', icon: <AlertCircle size={16} /> },
};

export function ReservationsPage() {
  const [reservations, setReservations] = useState<ReservationDetail[]>([]);
  const [statuses, setStatuses] = useState<ReservationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<number | 'all'>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [selectedReservation, setSelectedReservation] = useState<ReservationDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [changingStatus, setChangingStatus] = useState<number | null>(null);

  // Cargar reservaciones y estados
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener todas las reservaciones
        const resResp = await fetch('/api/v1/reservations/all');
        if (resResp.ok) {
          const data = await resResp.json();
          setReservations(data);
        }

        // Obtener estados de reservación (si existen)
        // Por ahora usamos los valores hardcoded
        setStatuses([
          { statusID: 1, statusName: 'Pendiente' },
          { statusID: 2, statusName: 'Confirmada' },
          { statusID: 3, statusName: 'Cancelada' },
        ]);
      } catch (error) {
        console.error('Error cargando reservaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar reservaciones
  const filteredReservations = reservations.filter((res) => {
    // Filtro por búsqueda (nombre o teléfono)
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      res.customersDto?.fullName.toLowerCase().includes(searchLower) ||
      res.customersDto?.phone?.includes(searchQuery) ||
      res.customersDto?.email?.toLowerCase().includes(searchLower);

    // Filtro por estado
    const matchesStatus = filterStatus === 'all' || res.statusID === filterStatus;

    // Filtro por fecha
    const matchesDate = !filterDate || res.reservationDate === filterDate;

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Cambiar estado de reservación
  const handleChangeStatus = async (reservationID: number, newStatusID: number) => {
    try {
      setChangingStatus(reservationID);
      const response = await fetch(`/api/v1/reservations/${reservationID}/status/${newStatusID}`, {
        method: 'POST',
      });

      if (response.ok) {
        // Actualizar la reservación localmente
        setReservations((prev) =>
          prev.map((res) => (res.reservationID === reservationID ? { ...res, statusID: newStatusID } : res))
        );

        // Actualizar el detalle si está abierto
        if (selectedReservation?.reservationID === reservationID) {
          setSelectedReservation((prev) => (prev ? { ...prev, statusID: newStatusID } : null));
        }
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
    } finally {
      setChangingStatus(null);
    }
  };

  const getStatusBadge = (statusID: number) => {
    const status = STATUS_MAP[statusID] || STATUS_MAP[1];
    return (
      <div className="status-badge" style={{ backgroundColor: `${status.color}15`, borderColor: status.color }}>
        <span style={{ color: status.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
          {status.icon}
          {status.label}
        </span>
      </div>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5); // HH:mm
  };

  return (
    <div className="reservations-page">
      <div className="adminPageTitleRow">
        <div>
          <div className="adminPageTitle">📋 Reservaciones</div>
          <div className="adminPageDesc">Gestiona las reservaciones del restaurante</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="reservations-filters">
        <div className="filter-group">
          <label>Buscar por cliente o teléfono</label>
          <input
            type="text"
            className="adminInput"
            placeholder="Ej: Juan Pérez, 849-1234567..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Estado</label>
          <select
            className="adminInput"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          >
            <option value="all">Todos los estados</option>
            {statuses.map((s) => (
              <option key={s.statusID} value={s.statusID}>
                {s.statusName}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Fecha</label>
          <input
            type="date"
            className="adminInput"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        <button
          className="adminButton"
          onClick={() => {
            setSearchQuery('');
            setFilterStatus('all');
            setFilterDate('');
          }}
        >
          Limpiar filtros
        </button>
      </div>

      {/* Tabla de reservaciones */}
      {loading ? (
        <div className="loading-state">
          <p>Cargando reservaciones...</p>
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={48} />
          <p>{searchQuery || filterStatus !== 'all' || filterDate ? 'No se encontraron reservaciones' : 'No hay reservaciones'}</p>
        </div>
      ) : (
        <div className="reservations-table-container">
          <table className="reservations-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Personas</th>
                <th>Mesa</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((res) => (
                <tr key={res.reservationID}>
                  <td>
                    <div className="cell-customer">
                      <div className="customer-name">{res.customersDto?.fullName || 'N/A'}</div>
                      <div className="customer-contact">{res.customersDto?.phone || res.customersDto?.email || '-'}</div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-date">
                      <Calendar size={16} />
                      {formatDate(res.reservationDate)}
                    </div>
                  </td>
                  <td>
                    <div className="cell-time">
                      <Clock size={16} />
                      {formatTime(res.reservationTime)}
                    </div>
                  </td>
                  <td>
                    <div className="cell-people">
                      <Users size={16} />
                      {res.numberOfPeople}
                    </div>
                  </td>
                  <td>
                    <div className="cell-table">
                      <MapPin size={16} />
                      Mesa #{res.restaurantTablesDto?.tableNumber || res.tableID}
                    </div>
                  </td>
                  <td>{getStatusBadge(res.statusID)}</td>
                  <td>
                    <button
                      className="adminButton small"
                      onClick={() => {
                        setSelectedReservation(res);
                        setShowDetailModal(true);
                      }}
                    >
                      <Eye size={14} /> Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalles */}
      {showDetailModal && selectedReservation && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles de la Reservación</h2>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>Información del Cliente</h3>
                <div className="detail-rows">
                  <div className="detail-row">
                    <span className="label">Nombre:</span>
                    <span className="value">{selectedReservation.customersDto?.fullName || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Teléfono:</span>
                    <span className="value">{selectedReservation.customersDto?.phone || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Email:</span>
                    <span className="value">{selectedReservation.customersDto?.email || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Detalles de la Reservación</h3>
                <div className="detail-rows">
                  <div className="detail-row">
                    <span className="label">Fecha:</span>
                    <span className="value">{formatDate(selectedReservation.reservationDate)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Hora:</span>
                    <span className="value">{formatTime(selectedReservation.reservationTime)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Número de Personas:</span>
                    <span className="value">{selectedReservation.numberOfPeople}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Mesa Asignada:</span>
                    <span className="value">
                      Mesa #{selectedReservation.restaurantTablesDto?.tableNumber || selectedReservation.tableID} (Capacidad:{' '}
                      {selectedReservation.restaurantTablesDto?.capacity})
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Estado:</span>
                    <span>{getStatusBadge(selectedReservation.statusID)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Creada:</span>
                    <span className="value">{new Date(selectedReservation.createdAt).toLocaleString('es-ES')}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Cambiar Estado</h3>
                <div className="status-buttons">
                  {Object.entries(STATUS_MAP).map(([statusID, status]) => (
                    <button
                      key={statusID}
                      className={`status-btn ${selectedReservation.statusID === Number(statusID) ? 'active' : ''}`}
                      style={{ borderColor: status.color }}
                      onClick={() => handleChangeStatus(selectedReservation.reservationID, Number(statusID))}
                      disabled={changingStatus === selectedReservation.reservationID}
                    >
                      {status.icon}
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="adminButton" onClick={() => setShowDetailModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
