import '../styles/menu.css'
import carne from '../assets/imagenes/carne.jpg'
import postre from '../assets/imagenes/postre.jpg'
import bebidas from '../assets/imagenes/bebidas.jpg'
import { useNavigate } from 'react-router-dom'

const categorias = [
    {
        img: carne,
        name: "Carnes"
       
    },
    {
        img: postre,
        name: "Postres"
    },
    {
        img: bebidas,
        name: "Vinos"
    }

];
const Menu = () => {
    const navega = useNavigate();
    return(
        <section id="menu" className='menu-section'>
           <div className='menu-container'>
            <div className='menu-header'>
                <p className='menu-subtitle'>Platos Exquisitos para disfrutar</p>
                    <h2 className='menu-title'>Nuestra Cocina</h2>
                    <div className='menu-divider'></div>
                    
                
            </div>
            <div className='menu-grid'>
                {categorias.map((d) =>(
                    <div key={d.name} className='menu-card'>
                        <div className='menu-image'>
                            <img src={d.img} alt={d.name} />
                        </div>
                        <h3 className='menu-name'>{d.name}</h3>
                    </div>
                ))}
                
            </div>
                       <button className='menu-button' onClick={() => navega("/menucomplete")}>Ver Menu</button>
           </div>
        </section>
    )

}
export default Menu;