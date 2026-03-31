import { Clock } from "lucide-react";
import "../styles/horario.css"
const schedules =[
        {day: "Lunes - Miercoles" ,hours: "12:00 pm - 10:00 pm"},
        {day: "Jueves - Viernes" ,hours: "12:00 pm - 11:30 pm"},
        {day: "Sabado", hours: "11:00 am - 11:30 pm"},
        {day: "Domingo", hours: "11:00 am - 09:00 pm"}
];
const Horario = () => {

        return(
           <section id="horario" className="hours-section">
                <div className="hours-container">
                        <p className="hours-subtitle">Planifica tu Visita</p>
                        <h2 className="hours-title">Horarios</h2>

                        <div className="hours-divider">
                                <div className="line"></div>
                                <Clock className="icon" size={20}/>
                                <div className="line"></div>
                        </div>

                        <div className="hours-grid">
                                {schedules.map((s) => (
                                        <div key={s.day} className="hours-card">
                                                <p className="day">{s.day}</p>
                                                <p className="time">{s.hours}</p>
                                        </div>
                                ))}
                        </div>
                        <p className="note">
                                 Se aceptan reservas con un mínimo de 2 horas de anticipación.
                        </p>
                </div>
           </section>
        )
}
export default Horario;