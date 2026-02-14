import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateReservationPage.css";
import { reservationService } from "../../services/reservation.service";

export const CreateReservationPage = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        guests: 1,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const result = await reservationService.create(form);

            navigate("/reserva-exitosa", {
                state: result,
            });

        } catch (error) {
            alert("Error creando reserva");
            console.log(error);
        }
    };



    return (
        <div className="reservation-container">
            <h2>Hacer Reservación</h2>

            <form onSubmit={handleSubmit} className="reservation-form">
                <input
                    type="text"
                    name="fullName"
                    placeholder="Nombre Completo"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Correo"
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="phone"
                    placeholder="Teléfono"
                    value={form.phone}
                    onChange={handleChange}
                    required
                />

                <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                />

                <input
                    type="time"
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                    required
                />

                <input
                    type="number"
                    name="guests"
                    min={1}
                    value={form.guests}
                    onChange={handleChange}
                    required
                />

                <button type="submit">Confirmar Reservación</button>
            </form>
        </div>
    );
};
