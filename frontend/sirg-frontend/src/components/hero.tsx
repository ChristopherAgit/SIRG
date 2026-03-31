import imagen from '../assets/imagenes/restaurante.jpeg'
import "../styles/hero.css";
const Hero= () =>{

    return(
        <section className="hero">
            <img src={imagen} alt="Restaurante Imagen" className="hero-bg" />

            <div className="hero-overlay"></div>
            <div className="hero-gradient"></div>
            <div className="hero-content" >
                <p className="hero-subtitle">Experiencia Gastronomica Unica</p>
                <h1 className="hero-title">
                    <span>Fuego</span> & Sal
                </h1>
                <p className="hero-description">
                    Donde cada plato es un obra maestra y cada vocado es un viaje de esplosion de sabores al paladar
                </p>
                <a  href="#reservas" className="hero-button"> Reservar Mesa</a>
            </div>
        </section>
    )

}
export default Hero;