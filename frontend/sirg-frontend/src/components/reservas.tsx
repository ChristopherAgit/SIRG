import { useState } from "react";
import "../styles/reservas.css";
import { useNavigate } from "react-router-dom";
import { LogOut, AlertCircle } from "lucide-react";
import { generarHorasDisponibles } from "../components/utilreservas";

interface Reservacion {
  nombre: string;
  cedula: string;
  celular: string;
  correo: string;
  fecha: string;
  hora: string;
  numberOfPeople: number;
  tableID: number | null;
}

interface Table {
  tableID: number;
  tableNumber: number;
  capacity: number;
  isActive: boolean;
}

const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD en hora local, sin desfase UTC

const Reservas = () => {
  const navega = useNavigate();

  const [form, setForm] = useState<Reservacion>({
    nombre: "",
    cedula: "",
    celular: "",
    correo: "",
    fecha: "",
    hora: "",
    numberOfPeople: 1,
    tableID: null,
  });

  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);
  const [mesasDisponibles, setMesasDisponibles] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Validación de cédula: solo números, máx 11
    if (name === "cedula") {
      const onlyNumbers = value.replace(/\D/g, "");
      if (onlyNumbers.length <= 11) {
        setForm({ ...form, cedula: onlyNumbers });
      }
      return;
    }

    // Validación de celular: solo números, máx 10
    if (name === "celular") {
      const onlyNumbers = value.replace(/\D/g, "");
      if (onlyNumbers.length <= 10) {
        setForm({ ...form, celular: onlyNumbers });
      }
      return;
    }

    // Cuando cambia la fecha: cargar horas disponibles
    if (name === "fecha") {
      // Parse date string YYYY-MM-DD reliably as local date (avoid timezone parsing issues)
      const parts = value.split("-").map((p) => Number(p));
      const fechaObj = new Date(parts[0], parts[1] - 1, parts[2]);
      const horas = generarHorasDisponibles(fechaObj);
      setHorasDisponibles(horas);
      setError("");

      setForm({
        ...form,
        fecha: value,
        hora: "",
        tableID: null,
      });
      setMesasDisponibles([]);
      return;
    }

    // Cuando cambia hora o número de personas: buscar mesas disponibles
    if (name === "hora" || name === "numberOfPeople") {
      const updatedForm = {
        ...form,
        [name]: name === "numberOfPeople" ? Number(value) : value,
      };

      setForm(updatedForm);
      setError("");
      setMesasDisponibles([]);

      // Si tiene fecha, hora y número de personas, buscar mesas
      if (updatedForm.fecha && updatedForm.hora && updatedForm.numberOfPeople > 0) {
        loadAvailableTables(updatedForm);
      }
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const loadAvailableTables = async (formData: Reservacion) => {
    try {
      setLoading(true);
      setError("");

      // Convertir fecha a formato ISO y hora a TimeOnly (HH:mm:00)
      const timeWithSeconds = formData.hora.includes(":") 
        ? formData.hora + (formData.hora.split(":").length === 2 ? ":00" : "")
        : formData.hora + ":00:00";

      const params = new URLSearchParams({
        date: formData.fecha,
        time: timeWithSeconds,
        numberOfPeople: formData.numberOfPeople.toString(),
      });

      const response = await fetch(
        `/api/v1/reservations/available-tables?${params}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener mesas disponibles");
      }

      const tables: Table[] = await response.json();

      if (tables.length === 0) {
        setError(
          `No hay mesas disponibles para ${formData.numberOfPeople} ${formData.numberOfPeople === 1 ? "persona" : "personas"} a las ${formData.hora}`
        );
      }

      setMesasDisponibles(tables);
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setError("Error al cargar mesas disponibles. Intente nuevamente.");
      setLoading(false);
    }
  };

  const handleTableSelect = (tableID: number) => {
    setForm({ ...form, tableID });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (form.cedula.length !== 11) {
      setError("La cédula debe contener 11 dígitos.");
      return;
    }

    if (form.celular.length !== 10) {
      setError("El celular debe contener 10 dígitos.");
      return;
    }

    if (!form.hora) {
      setError("Seleccione una hora válida.");
      return;
    }

    if (form.numberOfPeople <= 0 || form.numberOfPeople > 8) {
      setError("Ingrese un número válido de personas (1-8).");
      return;
    }

    if (!form.tableID) {
      setError("Seleccione una mesa.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        tableID: form.tableID,
        statusID: 1,
        reservationDate: form.fecha,
        reservationTime: form.hora + ":00",
        numberOfPeople: form.numberOfPeople,
        createdAt: new Date().toISOString(),
        customersDto: {
          fullName: form.nombre,
          phone: form.celular,
          email: form.correo,
        },
      };

      const response = await fetch("/api/v1/reservations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const errorText = await response.text();
        setError(`Error: ${errorText}`);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setError("Error al procesar la reserva. Intente nuevamente.");
      setLoading(false);
    }
  };

  return (
    <section id="reservas" className="reservation-section">
      <button className="btn-volver" onClick={() => navega("/")}>
        <LogOut size={15} className="icon-flip" /> Volver
      </button>

      <div className="reservation-container">
        <div className="reservation-header">
          <p className="reservation-subtitle">Tu Mesa te Espera</p>
          <h2>Hacer Reserva</h2>
        </div>

        {submitted ? (
          <div className="success-message">
            <h3>¡Reserva Confirmada!</h3>
            <p>
              Gracias <strong>{form.nombre}</strong>. Hemos recibido tu reserva
              para {form.numberOfPeople} {form.numberOfPeople === 1 ? "persona" : "personas"} el{" "}
              <strong>{form.fecha}</strong> a las <strong>{form.hora}</strong>. Confirmaremos tu reserva pronto.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="reservation-form">
            {/* Mostrar errores */}
            {error && (
              <div className="error-message">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-grid">
              {/* Información Personal */}
              <div className="form-group">
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Juan Pérez"
                  required
                />
              </div>

              <div className="form-group">
                <label>Cédula *</label>
                <input
                  type="text"
                  name="cedula"
                  value={form.cedula}
                  onChange={handleChange}
                  placeholder="00000000000"
                  required
                />
              </div>

              <div className="form-group">
                <label>Celular *</label>
                <input
                  type="text"
                  name="celular"
                  value={form.celular}
                  onChange={handleChange}
                  placeholder="0000000000"
                  required
                />
              </div>

              <div className="form-group">
                <label>Correo *</label>
                <input
                  type="email"
                  name="correo"
                  value={form.correo}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  required
                />
              </div>

              {/* Detalles de Reserva */}
              <div className="form-group">
                <label>Fecha *</label>
                <input
                  type="date"
                  min={today}
                  name="fecha"
                  value={form.fecha}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Hora *</label>
                <select
                  name="hora"
                  value={form.hora}
                  onChange={handleChange}
                  disabled={!form.fecha}
                  required
                >
                  <option value="">
                    {form.fecha ? "Seleccione una hora" : "Seleccione fecha primero"}
                  </option>
                  {horasDisponibles.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Número de Personas *</label>
                <select
                  name="numberOfPeople"
                  value={form.numberOfPeople}
                  onChange={handleChange}
                  disabled={!form.hora}
                  required
                >
                  <option value="">
                    {form.hora ? "Seleccione cantidad" : "Seleccione hora primero"}
                  </option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "persona" : "personas"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mesas Disponibles */}
            {loading && (
              <div className="loading-message">
                <p>Buscando mesas disponibles...</p>
              </div>
            )}

            {mesasDisponibles.length > 0 && (
              <div className="mesas-section">
                <h3>Mesas Disponibles</h3>
                <p className="mesas-subtitle">
                  Selecciona una mesa ({mesasDisponibles.length} disponible
                  {mesasDisponibles.length === 1 ? "" : "s"})
                </p>
                <div className="mesas-grid">
                  {mesasDisponibles.map((mesa) => (
                    <div
                      key={mesa.tableID}
                      className={`mesa-card ${
                        form.tableID === mesa.tableID ? "selected" : ""
                      }`}
                      onClick={() => handleTableSelect(mesa.tableID)}
                    >
                      <div className="mesa-number">Mesa {mesa.tableNumber}</div>
                      <div className="mesa-capacity">
                        Capacidad: {mesa.capacity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !form.tableID}
              className={loading ? "loading" : ""}
            >
              {loading ? "Procesando..." : "Confirmar Reserva"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Reservas;