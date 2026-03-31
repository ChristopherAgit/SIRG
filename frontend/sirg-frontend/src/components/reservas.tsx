import { useState } from "react";
import "../styles/reservas.css"

 interface Reservacion{
            nombre:string;
            cedula:string;
            celular:string;
            correo:string;
            fecha:string;
            hora:string;
            mesa: string

        }
const Reservas = () => {
    const [form, setForm] = useState<Reservacion>({
            nombre: "",
            cedula:"",
            celular:"",
            correo:"",
            fecha:"",
            hora:"",
            mesa:""
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement| HTMLTextAreaElement>) => {
        const { name, value} = e.target;

        if(name === "cedula"){
            const onlyNumbers = value.replace(/\D/g, "");

            if(onlyNumbers.length <= 11){
                setForm({...form, cedula: onlyNumbers});
            }
            return;
        }
         if(name === "celular"){
            const onlyNumbers = value.replace(/\D/g, "");

            if(onlyNumbers.length <= 10){
                setForm({...form, celular: onlyNumbers});
            }
            return;
        }
        
        setForm({...form, [name]: value});
    };
    const handleSubmit = async(e: React.FormEvent) =>{
        e.preventDefault();

        if(form.cedula.length !== 11){
            alert("La cedula debe contener 11 Digitos.");
            return;
        }
        if(form.celular.length !== 10){
            alert("La celular debe contener 10 Digitos.");
            return;
        }

        try{
            // API AQUI CHRISTOPHER
            const response = await fetch("",{
                method: "POST",
                headers:{
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify(form)
            });
            if(response.ok){
                setSubmitted(true);
            }
            else{
                alert("Error al guardar Reserva.");
            }
        }
        catch(error){
            console.error("Error:", error)
        }
    };
    return(
        <section id="reservas" className="reservation-section">
            <div className="reservation-container">
                <div className="reservation-header">
                    <p className="reservation-subtitle">Tu Mesa te Espera</p>
                    <h2>Hacer Reserva</h2>
                </div>
                {submitted ? (
                    <div className="success-message">
                        <h3>Reserva Enviada</h3>
                        <p> Gracias <strong>{form.nombre}</strong>. Confirmaremos su Reserva Pronto</p>
                    </div>
                ):(
                    <form onSubmit={handleSubmit} className="reservation-form">
                        <div className="form-grid">
                            <div>
                                <label>Nombre Completo</label>
                                <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required />
                            </div>
                            <div>
                                <label >Cedula</label>
                                <input type="text" name="cedula" value={form.cedula} onChange={handleChange} placeholder="00000000000" required />
                            </div>
                              <div>
                                <label >Celular</label>
                                <input type="text" name="celular" value={form.celular} onChange={handleChange} placeholder="0000000000" required />
                            </div>
                              <div>
                                <label >Correo</label>
                                <input type="email" name="correo" value={form.correo} onChange={handleChange} placeholder="soy@gmail.com" required  />
                            </div>
                            <div>
                                <label >Numero de Personas</label>
                                <select name="mesa" value={form.mesa} onChange={handleChange}>
                                    {[1,2,3,4,5,6,7,8].map ((n)=>( <option key={n} value={String (n)}> {n} {n === 1 ? "persona" : "personas"} </option> ))}
                                </select>
                            </div>
                            <div>
                                <label >Fecha</label>
                                <input type="date" name="fecha" value={form.fecha} onChange={handleChange} required />
                            </div>
                            <div>
                                <label>Hora</label>
                                <select name="hora" value={form.hora} onChange={handleChange}> {["12:00","13:00","14:00","19:00","20:00","21:00"].map((t)=>( <option key={t} value={t}>{t} </option> ))}</select>
                            </div>
                        </div>
                        <button type="submit">Confirmar Reserva</button>
                    </form>
                )}
            </div>
        </section>
    )
}

export default Reservas;

