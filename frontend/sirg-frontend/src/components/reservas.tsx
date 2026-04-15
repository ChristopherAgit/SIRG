// import { useState } from "react";
// import "../styles/reservas.css"
// import { useNavigate } from 'react-router-dom';
// import { LogOut } from "lucide-react";

//  interface Reservacion{
//             nombre:string;
//             cedula:string;
//             celular:string;
//             correo:string;
//             fecha:string;
//             hora:string;
//             mesa: string

//         }
// const today = new Date().toISOString().split("T")[0];
// const Reservas = () => {
//         const navega = useNavigate();

//     const [form, setForm] = useState<Reservacion>({
//             nombre: "",
//             cedula:"",
//             celular:"",
//             correo:"",
//             fecha:"",
//             hora:"",
//             mesa:""
//     });
//     const [submitted, setSubmitted] = useState(false);

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement| HTMLTextAreaElement>) => {
//         const { name, value} = e.target;

//         if(name === "cedula"){
//             const onlyNumbers = value.replace(/\D/g, "");

//             if(onlyNumbers.length <= 11){
//                 setForm({...form, cedula: onlyNumbers});
//             }
//             return;
//         }
//          if(name === "celular"){
//             const onlyNumbers = value.replace(/\D/g, "");

//             if(onlyNumbers.length <= 10){
//                 setForm({...form, celular: onlyNumbers});
//             }
//             return;
//         }
        
//         setForm({...form, [name]: value});
//     };
//     const handleSubmit = async(e: React.FormEvent) =>{
//         e.preventDefault();

//         if(form.cedula.length !== 11){
//             alert("La cedula debe contener 11 Digitos.");
//             return;
//         }
//         if(form.celular.length !== 10){
//             alert("La celular debe contener 10 Digitos.");
//             return;
//         }

//         try{
//             // API AQUI CHRISTOPHER
//             const response = await fetch("",{
//                 method: "POST",
//                 headers:{
//                     "Content-Type" : "application/json"
//                 },
//                 body: JSON.stringify(form)
//             });
//             if(response.ok){
//                 setSubmitted(true);
//             }
//             else{
//                 alert("Error al guardar Reserva.");
//             }
//         }
//         catch(error){
//             console.error("Error:", error)
//         }
//     };
//     return(
        
//         <section id="reservas" className="reservation-section">
//             <button className="btn-volver"  onClick={() => navega("/")}> <LogOut size={15} className="icon-flip"/> Volver </button>
//             <div className="reservation-container">
//                 <div className="reservation-header">
//                     <p className="reservation-subtitle">Tu Mesa te Espera</p>
//                     <h2>Hacer Reserva</h2>
//                 </div>
                
//                 {submitted ? (
//                     <div className="success-message">
//                         <h3>Reserva Enviada</h3>
//                         <p> Gracias <strong>{form.nombre}</strong>. Confirmaremos su Reserva Pronto</p>
//                     </div>
//                 ):(
                    
//                     <form onSubmit={handleSubmit} className="reservation-form">
//                         <div className="form-grid">
//                             <div className="form-group">
//                                 <label>Nombre Completo</label>
//                                 <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required />
//                             </div>
//                             <div className="form-group">
//                                 <label >Cedula</label>
//                                 <input type="text" name="cedula" value={form.cedula} onChange={handleChange} placeholder="00000000000" required />
//                             </div>
//                               <div className="form-group">
//                                 <label >Celular</label>
//                                 <input type="text" name="celular" value={form.celular} onChange={handleChange} placeholder="0000000000" required />
//                             </div>
//                               <div className="form-group">
//                                 <label >Correo</label>
//                                 <input type="email" name="correo" value={form.correo} onChange={handleChange} placeholder="soy@gmail.com" required  />
//                             </div>
//                             <div className="form-group">
//                                 <label >Fecha</label>
//                                 <input type="date" min={today} name="fecha" value={form.fecha} onChange={handleChange} required />
//                             </div>
//                             <div className="form-group">
//                                 <label >Numero de Personas</label>
//                                 <select name="mesa" value={form.mesa} onChange={handleChange}>
//                                     {[1,2,3,4,5,6,7,8].map ((n)=>( <option key={n} value={String (n)}> {n} {n === 1 ? "persona" : "personas"} </option> ))}
//                                 </select>
//                             </div>
//                             <div className="form-group">
//                                 <label>Hora</label>
//                                 <select name="hora" value={form.hora} onChange={handleChange}> {["12:00","13:00","14:00","19:00","20:00","21:00"].map((t)=>( <option key={t} value={t}>{t} </option> ))}</select>
//                             </div>
//                         </div>
//                         <button type="submit">Confirmar Reserva</button>
                        
//                     </form>

//                 )}
//             </div>
//         </section>
//     )
// }

// export default Reservas;

import { useState } from "react";
import "../styles/reservas.css";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { generarHorasDisponibles } from "../components/utilreservas"; // 👈 IMPORTANTE

interface Reservacion {
  nombre: string;
  cedula: string;
  celular: string;
  correo: string;
  fecha: string;
  hora: string;
  mesa: string;
}

const today = new Date().toISOString().split("T")[0];

const Reservas = () => {
  const navega = useNavigate();

  const [form, setForm] = useState<Reservacion>({
    nombre: "",
    cedula: "",
    celular: "",
    correo: "",
    fecha: "",
    hora: "",
    mesa: "",
  });

  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]); // 👈 NUEVO
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // 🔹 VALIDACIONES EXISTENTES
    if (name === "cedula") {
      const onlyNumbers = value.replace(/\D/g, "");
      if (onlyNumbers.length <= 11) {
        setForm({ ...form, cedula: onlyNumbers });
      }
      return;
    }

    if (name === "celular") {
      const onlyNumbers = value.replace(/\D/g, "");
      if (onlyNumbers.length <= 10) {
        setForm({ ...form, celular: onlyNumbers });
      }
      return;
    }

    // 🔥 CUANDO CAMBIA LA FECHA
    if (name === "fecha") {
      const fechaObj = new Date(value);
      const horas = generarHorasDisponibles(fechaObj);

      setHorasDisponibles(horas);

      setForm({
        ...form,
        fecha: value,
        hora: "", // 👈 resetear hora
      });

      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.cedula.length !== 11) {
      alert("La cedula debe contener 11 Digitos.");
      return;
    }

    if (form.celular.length !== 10) {
      alert("El celular debe contener 10 Digitos.");
      return;
    }

    if (!form.hora) {
      alert("Seleccione una hora válida.");
      return;
    }

    try {
      // Obtener mesas y escoger una que soporte la cantidad de personas
      const tablesResp = await fetch("/api/v1/tables");
      if (!tablesResp.ok) throw new Error("Error al obtener mesas");
      const tables = await tablesResp.json();

      const numPeople = Number(form.mesa) || 1;
      const table = tables.find((t: any) => t.isActive !== false && t.capacity >= numPeople);

      if (!table) {
        alert("No hay mesas disponibles para la cantidad de personas seleccionada.");
        return;
      }

      const payload = {
        tableID: table.tableID,
        statusID: 1,
        reservationDate: form.fecha, // YYYY-MM-DD
        reservationTime: form.hora + ":00", // HH:mm -> HH:mm:00
        numberOfPeople: numPeople,
        createdAt: new Date().toISOString(),
        customersDto: {
          name: form.nombre,
          cedula: form.cedula,
          phone: form.celular,
          email: form.correo,
        },
      };

      const response = await fetch("/api/v1/reservations/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const text = await response.text();
        alert("Error al guardar Reserva: " + text);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Ocurrió un error al procesar la reserva.");
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
            <h3>Reserva Enviada</h3>
            <p>
              Gracias <strong>{form.nombre}</strong>. Confirmaremos su Reserva
              Pronto
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="reservation-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Nombre Completo</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Cedula</label>
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
                <label>Celular</label>
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
                <label>Correo</label>
                <input
                  type="email"
                  name="correo"
                  value={form.correo}
                  onChange={handleChange}
                  placeholder="soy@gmail.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Fecha</label>
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
                <label>Numero de Personas</label>
                <select name="mesa" value={form.mesa} onChange={handleChange}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={String(n)}>
                      {n} {n === 1 ? "persona" : "personas"}
                    </option>
                  ))}
                </select>
              </div>

              {/* 🔥 HORAS DINÁMICAS */}
              <div className="form-group">
                <label>Hora</label>
                <select name="hora" value={form.hora} onChange={handleChange}>
                  <option value="">Seleccione una hora</option>

                  {horasDisponibles.length === 0 ? (
                    <option disabled>No hay horarios disponibles</option>
                  ) : (
                    horasDisponibles.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <button type="submit">Confirmar Reserva</button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Reservas;