import "../styles/nosotros.css"
const About = () => {
 const status = [
  {num: "10+", label: "Años de experiencia"},
  {num: "40+", label: "Platos e el menu"},
  {num: "4.8★", label: "Calificacion promedio"}
 ];
 return(
  <section id="nosotros" className="about-section">
    <div className="about-container">
      <div className="about-grid">
        
        <div className="about-text">
          <p className="about-subtitle">Nuestra Historia</p>
          <h2 className="about-title">
            Pasion por la <br />
            <span>buena comida</span>
          </h2>
           <div className="about-line"></div>
            <p className="about-description">
              Nuestro restaurante fue fundado con la idea de ofrecer una experiencia
              gastronómica única, donde cada plato sea preparado con dedicación
              y los mejores ingredientes. Desde nuestros inicios hemos buscado
              combinar tradición y creatividad para sorprender a nuestros clientes.
            </p>
            <p className="about-description">
              Trabajamos con ingredientes frescos y seleccionados para garantizar
              la mejor calidad. Nuestro objetivo es que cada visitante disfrute
              de un ambiente acogedor y sabores que recuerde siempre.
            </p>
            <div className="about-stats">
              {status.map((s) =>(
                <div key={s.label}>
                  <p className="stat-number">{s.num}</p>
                  <p className="stat-label">{s.label}</p>
                </div>
              ))}
            </div>
        </div>
        <div className="about-quote-container">
          <div className="about-quote-card">
            <span className="quote-symbol">"</span>
             <blockquote className="quote-text">
                Cocinar no es solo preparar comida, es crear momentos que las
                personas recuerdan. Cada plato cuenta una historia y queremos
                que nuestros clientes sean parte de ella.
              </blockquote>
              <div className="quote-author">
                <div className="author-avatar">JR</div>
                <div>
                  <p className="author-name">Chef Juan Ramirez</p>
                  <p className="author-role">Chef Ejecutivo</p>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  </section>
 );
};
export default About;